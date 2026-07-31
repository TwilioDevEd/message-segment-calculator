# Scripts

Utility scripts for this repo. Not part of the published package.

## `manual-test-plan.js`

Manual test harness that runs the test-plan cases from the calculator against a real Twilio account and compares Twilio's billed `num_segments` with the calculator's predicted `segmentsCount`, printing PASS/FAIL per case.

The 16 cases cover the four input classes whose segment counts changed since `v1.2.0` (CRLF line breaks, combining-mark graphemes, Smart Encoding substitutions, and the cosmetic UCS-2 code-unit fix), plus baseline regression guards.

It consumes the built library in `../dist`, so run `npm run release` (or `npm run build`) first if `dist/` is stale.

### Dry run (no credentials, nothing sent)

Prints predicted encoding, character count, and segment count for every case:

```bash
node scripts/manual-test-plan.js --dry-run
# or via npm (note the -- before flags):
npm run test:manual -- --dry-run
```

Scope to specific cases with `--only`:

```bash
node scripts/manual-test-plan.js --dry-run --only 1a,2b,5e
```

### Live run (sends real messages)

A live run sends each input from your Twilio account, polls the Message resource, and diffs `num_segments` against the prediction. Credentials are read from the environment only. Nothing is hard-coded.

For authentication, Twilio recommends an [API key](https://www.twilio.com/docs/usage/requests-to-twilio) SID and secret pair. The script prefers that pair and falls back to the account Auth Token. The Account SID is always required regardless, because it identifies the account in the request URL path (the API key SID does not replace it).

#### Generating an API key

If you don't have an API key yet, create one in the [Twilio Console](https://www.twilio.com/docs/iam/api-keys/keys-in-console) under **Account** > **API keys & tokens**. This keeps your Account SID and Auth Token out of this script and its environment. The secret is shown only once and is never retrievable again, so copy the `sid` (`SK...`) and `secret` immediately into the `TWILIO_API_KEY` / `TWILIO_API_SECRET` exports below.

Prefer a [Restricted key](https://www.twilio.com/docs/iam/api-keys/restricted-api-keys) scoped to just what this script does: Messages create and read. That grants far less than a Standard key, which can reach nearly every Twilio API. You can create Restricted keys only in the US region. On other regions, fall back to a Standard key.

| Env var | Required | Purpose |
|---|---|---|
| `TWILIO_ACCOUNT_SID` | yes | Account SID (`AC...`). Used in the request URL path. |
| `TWILIO_API_KEY` | preferred | API key SID (`SK...`), used as the Basic-auth username. |
| `TWILIO_API_SECRET` | preferred | API key secret, used as the Basic-auth password. |
| `TWILIO_AUTH_TOKEN` | fallback | Auth Token. Used only when no API key pair is set. |
| `TWILIO_FROM` | yes | Sending number or Messaging Service SID (`MG...`) |
| `TWILIO_TO` | yes | Destination test number |
| `TWILIO_FROM_SMART` | no | Messaging Service SID with Smart Encoding ON, used for the Class 3 "smart ON" cases (3b, 3d). Those cases self-skip if unset. |

```bash
export TWILIO_ACCOUNT_SID=AC...
export TWILIO_API_KEY=SK...       # recommended; falls back to TWILIO_AUTH_TOKEN
export TWILIO_API_SECRET=...
export TWILIO_FROM=+1...          # or MG... for a Messaging Service
export TWILIO_TO=+1...
export TWILIO_FROM_SMART=MG...    # optional, for the Smart Encoding cases

npm run test:manual
# or a subset:
node scripts/manual-test-plan.js --only 1a,1b,2b
```

The process exits non-zero if any case fails (Twilio's count differs from the prediction), so it can gate CI or a release check. A failure is the real finding: it means the calculator and Twilio disagree on that input.

### Flags

| Flag | Effect |
|---|---|
| `--dry-run` | Print predictions only. No sends, no credentials needed. |
| `--only <ids>` | Comma-separated case ids to run, e.g. `--only 1a,2b`. |
