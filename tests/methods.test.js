const { SegmentedMessage } = require('../dist');

describe('Test SegmentedMessage methods', () => {
  it('getNonGsmCharacters()', () => {
    const testMessage = 'más';
    const segmentedMessage = new SegmentedMessage(testMessage);
    expect(segmentedMessage.getNonGsmCharacters()).toEqual(['á']);
  }) 
});
