const { SegmentedMessage } = require('../dist');

const GSM7EscapeChars = ['|', '^', '€', '{', '}', '[', ']', '~', '\\'];

const TestData = [
  {
    testDescription: 'GSM-7 in one segment',
    body: '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890',
    encoding: 'GSM-7',
    segments: 1,
    messageSize: 1120,
    totalSize: 1120,
  },
  {
    testDescription: 'GSM-7 in two segments',
    body: '12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901',
    encoding: 'GSM-7',
    segments: 2,
    messageSize: 1127,
    totalSize: 1223,
  },
  {
    testDescription: 'GSM-7 in three segments',
    body: '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567',
    encoding: 'GSM-7',
    segments: 3,
    messageSize: 2149,
    totalSize: 2293,
  },
  {
    testDescription: 'UCS-2 message in one segment',
    body: '😜23456789012345678901234567890123456789012345678901234567890123456789',
    encoding: 'UCS-2',
    segments: 1,
    messageSize: 1120,
    totalSize: 1120,
  },
  {
    testDescription: 'UCS-2 message in two segments',
    body: '😜234567890123456789012345678901234567890123456789012345678901234567890',
    encoding: 'UCS-2',
    segments: 2,
    messageSize: 1136,
    totalSize: 1232,
  },
  {
    testDescription: 'UCS-2 message in three segments',
    body: '😜2345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234',
    encoding: 'UCS-2',
    segments: 3,
    messageSize: 2160,
    totalSize: 2304,
  },
];

describe('Basic tests', () => {
  TestData.forEach((testMessage) => {
    test(testMessage.testDescription, () => {
      const segmentedMessage = new SegmentedMessage(testMessage.body);
      expect(segmentedMessage.encodingName).toBe(testMessage.encoding);
      expect(segmentedMessage.segments.length).toBe(testMessage.segments);
      expect(segmentedMessage.segmentsCount).toBe(testMessage.segments)
      expect(segmentedMessage.messageSize).toBe(testMessage.messageSize);
      expect(segmentedMessage.totalSize).toBe(testMessage.totalSize);
    });
  });
});

describe('GSM-7 Escape Characters', () => {
  GSM7EscapeChars.forEach((escapeChar) => {
    test(`One segment with escape character ${escapeChar}`, () => {
      const segmentedMessage = new SegmentedMessage(
        `${escapeChar}12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678`,
      );
      expect(segmentedMessage.encodingName).toBe('GSM-7');
      expect(segmentedMessage.segments.length).toBe(1);
      expect(segmentedMessage.segmentsCount).toBe(1)
      expect(segmentedMessage.messageSize).toBe(1120);
      expect(segmentedMessage.totalSize).toBe(1120);
    });
    test(`Two segments with escape character ${escapeChar}`, () => {
      const segmentedMessage = new SegmentedMessage(
        `${escapeChar}123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789`,
      );
      expect(segmentedMessage.encodingName).toBe('GSM-7');
      expect(segmentedMessage.segments.length).toBe(2);
      expect(segmentedMessage.segmentsCount).toBe(2)
      expect(segmentedMessage.messageSize).toBe(1127);
      expect(segmentedMessage.totalSize).toBe(1223);
    });
  });
});

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
});
