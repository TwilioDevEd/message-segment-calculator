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
    characters: 160,
    unicodeScalars: 160,
  },
  {
    testDescription: 'GSM-7 in two segments',
    body: '12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901',
    encoding: 'GSM-7',
    segments: 2,
    messageSize: 1127,
    totalSize: 1223,
    characters: 161,
    unicodeScalars: 161,
  },
  {
    testDescription: 'GSM-7 in three segments',
    body: '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567',
    encoding: 'GSM-7',
    segments: 3,
    messageSize: 2149,
    totalSize: 2293,
    characters: 307,
    unicodeScalars: 307,
  },
  {
    testDescription: 'UCS-2 message in one segment',
    body: '😜23456789012345678901234567890123456789012345678901234567890123456789',
    encoding: 'UCS-2',
    segments: 1,
    messageSize: 1120,
    totalSize: 1120,
    characters: 69,
    unicodeScalars: 69,
  },
  {
    testDescription: 'UCS-2 message in two segments',
    body: '😜234567890123456789012345678901234567890123456789012345678901234567890',
    encoding: 'UCS-2',
    segments: 2,
    messageSize: 1136,
    totalSize: 1232,
    characters: 70,
    unicodeScalars: 70,
  },
  {
    testDescription: 'UCS-2 message in three segments',
    body: '😜2345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234',
    encoding: 'UCS-2',
    segments: 3,
    messageSize: 2160,
    totalSize: 2304,
    characters: 134,
    unicodeScalars: 134,
  },
  {
    testDescription: 'UCS-2 with two bytes extended characters in one segments boundary',
    body: '🇮🇹234567890123456789012345678901234567890123456789012345678901234567',
    encoding: 'UCS-2',
    segments: 1,
    messageSize: 1120,
    totalSize: 1120,
    characters: 67,
    unicodeScalars: 68,
  },
  {
    testDescription: 'UCS-2 with extended characters in two segments boundary',
    body: '🇮🇹2345678901234567890123456789012345678901234567890123456789012345678',
    encoding: 'UCS-2',
    segments: 2,
    messageSize: 1136,
    totalSize: 1232,
    characters: 68,
    unicodeScalars: 69,
  },
  {
    testDescription: 'UCS-2 with four bytes extended characters in one segments boundary',
    body: '🏳️‍🌈2345678901234567890123456789012345678901234567890123456789012345',
    encoding: 'UCS-2',
    segments: 1,
    messageSize: 1120,
    totalSize: 1120,
    characters: 65,
    unicodeScalars: 68,
  },
  {
    testDescription: 'UCS-2 with four bytes extended characters in two segments boundary',
    body: '🏳️‍🌈23456789012345678901234567890123456789012345678901234567890123456',
    encoding: 'UCS-2',
    segments: 2,
    messageSize: 1136,
    totalSize: 1232,
    characters: 66,
    unicodeScalars: 69,
  },
];

describe('Basic tests', () => {
  TestData.forEach((testMessage) => {
    test(testMessage.testDescription, () => {
      const segmentedMessage = new SegmentedMessage(testMessage.body);
      expect(segmentedMessage.encodingName).toBe(testMessage.encoding);
      expect(segmentedMessage.segments.length).toBe(testMessage.segments);
      expect(segmentedMessage.segmentsCount).toBe(testMessage.segments);
      expect(segmentedMessage.messageSize).toBe(testMessage.messageSize);
      expect(segmentedMessage.totalSize).toBe(testMessage.totalSize);
      expect(segmentedMessage.numberOfUnicodeScalars).toBe(testMessage.unicodeScalars);
      expect(segmentedMessage.numberOfCharacters).toBe(testMessage.characters);
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
      expect(segmentedMessage.segmentsCount).toBe(1);
      expect(segmentedMessage.messageSize).toBe(1120);
      expect(segmentedMessage.totalSize).toBe(1120);
    });
    test(`Two segments with escape character ${escapeChar}`, () => {
      const segmentedMessage = new SegmentedMessage(
        `${escapeChar}123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789`,
      );
      expect(segmentedMessage.encodingName).toBe('GSM-7');
      expect(segmentedMessage.segments.length).toBe(2);
      expect(segmentedMessage.segmentsCount).toBe(2);
      expect(segmentedMessage.messageSize).toBe(1127);
      expect(segmentedMessage.totalSize).toBe(1223);
    });
  });
});

describe('One grapheme UCS-2 characters', () => {
  const testCharacters = ['Á', 'Ú', 'ú', 'ç', 'í', 'Í', 'ó', 'Ó'];
  testCharacters.forEach((character) => {
    test(`One segment, 70 characters of "${character}"`, () => {
      const testMessage = Array(70).fill(character).join('');
      const segmentedMessage = new SegmentedMessage(testMessage);
      expect(segmentedMessage.segmentsCount).toBe(1);
      segmentedMessage.encodedChars.forEach((encodedChar) => {
        expect(encodedChar.isGSM7).toBe(false);
      });
    });
  });

  testCharacters.forEach((character) => {
    test(`Two segments, 71 characters of "${character}"`, () => {
      const testMessage = Array(71).fill(character).join('');
      const segmentedMessage = new SegmentedMessage(testMessage);
      expect(segmentedMessage.segmentsCount).toBe(2);
      segmentedMessage.encodedChars.forEach((encodedChar) => {
        expect(encodedChar.isGSM7).toBe(false);
      });
    });
  });
});

describe('Special tests', () => {
  test('UCS2 message with special GSM characters in one segment', () => {
    // Issue #18: wrong segmnent calculation using GSM special characters
    const testMessage = '😀]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]';
    const segmentedMessage = new SegmentedMessage(testMessage);
    expect(segmentedMessage.segmentsCount).toBe(1);
  });

  test('UCS2 message with special GSM characters in two segment', () => {
    const testMessage = '😀]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]';
    const segmentedMessage = new SegmentedMessage(testMessage);
    expect(segmentedMessage.segmentsCount).toBe(2);
  });
});

describe('Line break styles tests', () => {
  test('Message with Windows line break style and auto line break style detection', () => {
    const testMessage = 'abcde\r\n123';
    const segmentedMessage = new SegmentedMessage(testMessage);
    expect(segmentedMessage.numberOfCharacters).toBe(10);
  });

  test('Message with Windows line break style and Unix line break style selected', () => {
    const testMessage = 'abcde\r\n123';
    const segmentedMessage = new SegmentedMessage(testMessage, 'auto', 'LF');
    expect(segmentedMessage.numberOfCharacters).toBe(9);
  });

  test('Message with Unix line break style and auto line break style detection', () => {
    const testMessage = '\nabcde\n\n123\n';
    const segmentedMessage = new SegmentedMessage(testMessage);
    expect(segmentedMessage.numberOfCharacters).toBe(12);
  });

  test('Message with Unix line break style and Windows line break style selected', () => {
    const testMessage = 'abcde\n123\n';
    const segmentedMessage = new SegmentedMessage(testMessage, 'auto', 'CRLF');
    expect(segmentedMessage.numberOfCharacters).toBe(12);
  });

  test('Message with Windows line break style and Windows line break style selected', () => {
    const testMessage = 'abcde\r\n123';
    const segmentedMessage = new SegmentedMessage(testMessage, 'auto', 'CRLF');
    expect(segmentedMessage.numberOfCharacters).toBe(10);
  });

  test('Message with multiple line break styles', () => {
    const testMessage = '\nabcde\r\n123';
    expect(() => {
      new SegmentedMessage(testMessage, 'auto', 'CRLF');
    }).toThrow('Multiple linebreak styles detected, please use a single line break style');
  });
});
