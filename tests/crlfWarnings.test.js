const { analyzeSms } = require('../dist/browser/segmenter');

const LINE_BREAK_WARNING =
  'The message has line breaks, the web page utility only supports LF style. If you insert a CRLF it will be converted to LF.';

describe('CRLF segment warnings', () => {
  test('adds the pricing warning only when CRLF would increase the segment count', () => {
    const affected = analyzeSms(`${'a'.repeat(158)}\nb`, 'auto', false);
    expect(affected.warnings).toEqual([LINE_BREAK_WARNING, 'LF segment count: 1; CRLF may use 2 and affect pricing.']);
  });

  test('only shows the generic line-break warning when the segment count is unchanged', () => {
    expect(analyzeSms('a\nb', 'auto', false).warnings).toEqual([LINE_BREAK_WARNING]);
  });

  test('shows no warnings for a message with no line breaks', () => {
    expect(analyzeSms('abcde', 'auto', false).warnings).toEqual([]);
  });

  // A native <textarea> strips \r from its value, so `analyzeSms` never actually sees a real
  // CRLF/mixed message from the deployed UI - only the generic warning applies here.
  test('only shows the generic warning for a message that already contains real CRLF', () => {
    expect(analyzeSms('a\r\nb', 'auto', false).warnings).toEqual([LINE_BREAK_WARNING]);
  });
});
