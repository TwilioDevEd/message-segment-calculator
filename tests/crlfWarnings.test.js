const { analyzeSms } = require('../dist/browser/segmenter');

describe('CRLF segment warnings', () => {
  test('warns only when CRLF increases the segment count', () => {
    const affected = analyzeSms(`${'a'.repeat(158)}\nb`, 'auto', false);
    expect(affected.warnings).toEqual(['LF segment count: 1; CRLF may use 2 and affect pricing.']);
  });

  test('does not warn when the segment count is unchanged', () => {
    expect(analyzeSms('a\nb', 'auto', false).warnings).toEqual([]);
  });
});
