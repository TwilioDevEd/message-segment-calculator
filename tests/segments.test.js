
const { SegmentedMessage } = require('../dist');

describe('GSM-7 Segements analysis', () => {
    const testMessage =
      '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567';
    const segmentedMessage = new SegmentedMessage(testMessage);
    test('Check User Data Header', () => {
      for (var segmentIndex = 0; segmentIndex <= 2; segmentIndex++) {
        for (var index = 0; index < 6; index++) {
          expect(segmentedMessage.segments[segmentIndex][index].isUserDataHeader).toBe(true);
        }
      }
    });
  
    test('Check last segment has only 1 character', () => {
      expect(segmentedMessage.segments[2].length).toBe(7);
      expect(segmentedMessage.segments[2][6].raw).toBe('7');
    });
  });
  
  describe('UCS-2 Segements analysis', () => {
    const testMessage =
      '😜2345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234';
    const segmentedMessage = new SegmentedMessage(testMessage);
    test('Check User Data Header', () => {
      for (var segmentIndex = 0; segmentIndex <= 2; segmentIndex++) {
        for (var index = 0; index < 6; index++) {
          expect(segmentedMessage.segments[segmentIndex][index].isUserDataHeader).toBe(true);
        }
      }
    });
  
    test('Check last segment has only 1 character', () => {
      expect(segmentedMessage.segments[2].length).toBe(7);
      expect(segmentedMessage.segments[2][6].raw).toBe('4');
    });
});