#!/usr/bin/env node
/*
 * Manual test harness for the segment calculator.
 *
 * Sends each test-plan input from a real Twilio account and compares Twilio's
 * billed `num_segments` against the calculator's predicted `segmentsCount`.
 *
 * The predicted values live in TEST_CASES below. They were produced by running
 * the current build of ./dist against each input, and the script recomputes
 * them at runtime so a library change is caught even if this table drifts.
 *
 * Nothing sensitive is hard-coded. Credentials come from the environment.
 *
 * The Account SID is always required (it identifies the account in the request
 * URL path). For the Basic-auth credentials Twilio recommends an API key pair
 * for production; this script prefers it and falls back to the auth token:
 *   TWILIO_ACCOUNT_SID   Account SID (AC...), always required
 *   TWILIO_API_KEY       API key SID (SK...), used as the Basic-auth username
 *   TWILIO_API_SECRET    API key secret, used as the Basic-auth password
 *   TWILIO_AUTH_TOKEN    Auth token, fallback when no API key pair is set
 *   TWILIO_FROM          Sending number or Messaging Service SID (MG...)
 *   TWILIO_TO            Destination test number
 *   TWILIO_FROM_SMART    Optional: Messaging Service SID (MG...) with Smart
 *                        Encoding ON, used for the Class 3 "smart ON" cases.
 *
 * The API key SID does NOT replace the Account SID in the URL path: both are
 * needed. See https://www.twilio.com/docs/usage/requests-to-twilio
 *
 * Usage:
 *   node scripts/manual-test-plan.js            # send + poll + compare
 *   node scripts/manual-test-plan.js --dry-run  # print predictions only, no sends
 *   node scripts/manual-test-plan.js --only 1a,2b
 */

'use strict';

const { SegmentedMessage } = require('../dist');

const REST_BASE = 'https://api.twilio.com/2010-04-01';
const POLL_ATTEMPTS = 10;
const POLL_INTERVAL_MS = 1500;

/*
 * Each case: a builder for the input string (so control chars and combining
 * marks are unambiguous), whether Smart Encoding should be on, and a short note.
 * `smart: true` cases are routed to TWILIO_FROM_SMART when available.
 */
const TEST_CASES = [
  // CRLF must be mid-message: Twilio trims trailing line breaks, so a break at
  // the end never tests how CRLF is counted. 1a is the discriminating case:
  // calculator counts CRLF as 2 (161 -> 2 segs); CRLF-as-1 would be 160 -> 1 seg.
  { id: '1a', note: '80a + CRLF + 79a (mid-message)', smart: false, build: () => `${'a'.repeat(80)}\r\n${'a'.repeat(79)}` },
  { id: '1b', note: '80a + LF + 79a (mid-message)', smart: false, build: () => `${'a'.repeat(80)}\n${'a'.repeat(79)}` },
  // Same CRLF question at the 2/3-segment boundary (153/seg): calc 307 -> 3 segs; CRLF-as-1 306 -> 2 segs.
  { id: '1c', note: '200a + CRLF + 105a (2/3 boundary)', smart: false, build: () => `${'a'.repeat(200)}\r\n${'a'.repeat(105)}` },

  { id: '2a', note: '70 x precomposed é', smart: false, build: () => 'é'.repeat(70) },
  { id: '2b', note: '70 x decomposed e+U+0301', smart: false, build: () => 'é'.repeat(70) },
  { id: '2c', note: '1 x decomposed e+U+0301', smart: false, build: () => 'é' },

  { id: '3a', note: 'curly quotes, smart OFF', smart: false, build: () => '“Hi”' },
  { id: '3b', note: 'curly quotes, smart ON', smart: true, build: () => '“Hi”' },
  { id: '3c', note: 'low-quote + ZWNJ, smart OFF', smart: false, build: () => 'a„b‌c' },
  { id: '3d', note: 'low-quote + ZWNJ, smart ON', smart: true, build: () => 'a„b‌c' },

  { id: '4', note: 'emoji + pipe (UCS-2 codeUnits, cosmetic)', smart: false, build: () => '\u{1F600}|' },

  { id: '5a', note: '160 x a', smart: false, build: () => 'a'.repeat(160) },
  { id: '5b', note: '161 x a', smart: false, build: () => 'a'.repeat(161) },
  { id: '5c', note: '70 x 中', smart: false, build: () => '中'.repeat(70) },
  { id: '5d', note: '71 x 中', smart: false, build: () => '中'.repeat(71) },
  { id: '5e', note: '1 x pipe (GSM extension char)', smart: false, build: () => '|' },
];

function predict(input, smart) {
  const seg = new SegmentedMessage(input, 'auto', smart);
  return {
    encoding: seg.encodingName,
    characters: seg.numberOfCharacters,
    segments: seg.segmentsCount,
  };
}

function parseArgs(argv) {
  const opts = { dryRun: false, only: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') opts.dryRun = true;
    else if (a === '--only') opts.only = new Set((argv[++i] || '').split(',').map((s) => s.trim()).filter(Boolean));
    else if (a.startsWith('--only=')) opts.only = new Set(a.slice(7).split(',').map((s) => s.trim()).filter(Boolean));
    else throw new Error(`Unknown argument: ${a}`);
  }
  return opts;
}

function requireEnv(names) {
  const missing = names.filter((n) => !process.env[n]);
  if (missing.length) {
    console.error(`Missing required env var(s): ${missing.join(', ')}`);
    console.error('See the header comment in this file for the full list.');
    process.exit(1);
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/*
 * Resolve Basic-auth credentials from the environment. Twilio recommends an
 * API key SID + secret pair for production; the auth token is a fallback for
 * local testing. Either way the Account SID stays in the URL path.
 */
function resolveCredentials() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const apiKey = process.env.TWILIO_API_KEY;
  const apiSecret = process.env.TWILIO_API_SECRET;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid) return { error: 'TWILIO_ACCOUNT_SID is required (identifies the account in the request URL).' };

  // A half-configured API key pair is almost always a typo. Fail loudly rather
  // than silently falling back to the broader-privilege auth token.
  if (Boolean(apiKey) !== Boolean(apiSecret)) {
    return { error: 'TWILIO_API_KEY and TWILIO_API_SECRET must be set together (only one was provided).' };
  }

  let username;
  let password;
  let mode;
  if (apiKey && apiSecret) {
    username = apiKey;
    password = apiSecret;
    mode = 'API key';
  } else if (authToken) {
    username = accountSid;
    password = authToken;
    mode = 'auth token';
  } else {
    return { error: 'Set TWILIO_API_KEY + TWILIO_API_SECRET (recommended) or TWILIO_AUTH_TOKEN for authentication.' };
  }

  return {
    accountSid,
    mode,
    authHeader: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
  };
}

async function sendMessage({ accountSid, authHeader, from, to, body }) {
  const form = new URLSearchParams();
  form.set('To', to);
  form.set(from.startsWith('MG') ? 'MessagingServiceSid' : 'From', from);
  form.set('Body', body);

  const res = await fetch(`${REST_BASE}/Accounts/${accountSid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: form,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`send failed (${res.status}): ${data.message || JSON.stringify(data)}`);
  return data.sid;
}

async function fetchMessage({ accountSid, authHeader, sid }) {
  const res = await fetch(`${REST_BASE}/Accounts/${accountSid}/Messages/${sid}.json`, {
    headers: { Authorization: authHeader },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`fetch failed (${res.status}): ${data.message || JSON.stringify(data)}`);
  return data;
}

async function resolveSegments(creds, sid) {
  // num_segments is populated once Twilio has queued/sent the message.
  for (let i = 0; i < POLL_ATTEMPTS; i++) {
    const msg = await fetchMessage({ ...creds, sid });
    if (msg.num_segments && msg.num_segments !== '0') {
      return { numSegments: Number(msg.num_segments), status: msg.status };
    }
    await sleep(POLL_INTERVAL_MS);
  }
  return { numSegments: null, status: 'unresolved' };
}

async function main() {
  const opts = parseArgs(process.argv);
  const cases = opts.only ? TEST_CASES.filter((c) => opts.only.has(c.id)) : TEST_CASES;
  if (opts.only && cases.length === 0) {
    console.error(`No cases matched --only. Valid ids: ${TEST_CASES.map((c) => c.id).join(', ')}`);
    process.exit(1);
  }

  console.log(`Manual test plan - ${cases.length} case(s)${opts.dryRun ? ' [DRY RUN]' : ''}\n`);

  if (opts.dryRun) {
    for (const c of cases) {
      const p = predict(c.build(), c.smart);
      console.log(
        `${c.id.padEnd(4)} ${c.note.padEnd(38)} enc=${p.encoding.padEnd(6)} chars=${String(p.characters).padStart(3)} segs=${p.segments}`,
      );
    }
    console.log('\nDry run only: no messages sent. Predicted values shown above.');
    return;
  }

  requireEnv(['TWILIO_FROM', 'TWILIO_TO']);
  const creds = resolveCredentials();
  if (creds.error) {
    console.error(creds.error);
    process.exit(1);
  }
  console.log(`Authenticating with ${creds.mode}.\n`);
  const from = process.env.TWILIO_FROM;
  const fromSmart = process.env.TWILIO_FROM_SMART;
  const to = process.env.TWILIO_TO;

  const results = [];
  for (const c of cases) {
    const input = c.build();
    const predicted = predict(input, c.smart);
    const sender = c.smart && fromSmart ? fromSmart : from;

    if (c.smart && !fromSmart) {
      console.log(`${c.id}: SKIPPED (smart-encoding case, but TWILIO_FROM_SMART not set)`);
      results.push({ id: c.id, skipped: true });
      continue;
    }

    try {
      const sid = await sendMessage({ ...creds, from: sender, to, body: input });
      const { numSegments, status } = await resolveSegments(creds, sid);
      const match = numSegments === predicted.segments;
      const verdict = numSegments == null ? 'UNRESOLVED' : match ? 'PASS' : 'FAIL';
      console.log(
        `${c.id.padEnd(4)} ${verdict.padEnd(10)} predicted segs=${predicted.segments} (${predicted.encoding}) | twilio num_segments=${numSegments == null ? '?' : numSegments} | status=${status} | sid=${sid}`,
      );
      results.push({ id: c.id, predicted: predicted.segments, actual: numSegments, verdict });
    } catch (err) {
      console.log(`${c.id.padEnd(4)} ERROR      ${err.message}`);
      results.push({ id: c.id, error: err.message });
    }
  }

  const pass = results.filter((r) => r.verdict === 'PASS').length;
  const fail = results.filter((r) => r.verdict === 'FAIL');
  const other = results.filter((r) => r.skipped || r.error || r.verdict === 'UNRESOLVED');
  console.log(`\nSummary: ${pass} passed, ${fail.length} failed, ${other.length} skipped/unresolved/errored.`);
  if (fail.length) {
    console.log('Failures (these are the real findings):');
    for (const r of fail) console.log(`  ${r.id}: predicted ${r.predicted}, Twilio billed ${r.actual}`);
  }
  process.exitCode = fail.length ? 1 : 0;
}

main().catch((err) => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
