const expectExport = require('expect');
const { SegmentedMessage } = require('../dist');
const SmartEncodingMap = require('../dist/libs/SmartEncodingMap').default;

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

describe('Smart Encoding', () => {
  test.each(Object.entries(SmartEncodingMap))('With Smart Encoding enabled - maps %s to %s', (key, value) => {
    const segmentedMessage = new SegmentedMessage(key, 'auto', true);
    expect(segmentedMessage.graphemes.join('')).toBe(value);
  });
  test.each(Object.entries(SmartEncodingMap))('With Smart Encoding disabled - does not modify %s', (key) => {
    const segmentedMessage = new SegmentedMessage(key, 'auto', false);
    expect(segmentedMessage.graphemes.join('')).toBe(key);
  });
  test('Replace all Smart Encoding chars at once', () => {
    const testString = Object.keys(SmartEncodingMap).join('');
    const expected = Object.values(SmartEncodingMap).join('');
    const segmentedMessage = new SegmentedMessage(testString, 'auto', true);
    expect(segmentedMessage.graphemes.join('')).toBe(expected);
  });
});

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
  test('Message with CRLF line break style and auto line break style detection', () => {
    const testMessage = '\rabcde\r\n123';
    const segmentedMessage = new SegmentedMessage(testMessage);
    expect(segmentedMessage.numberOfCharacters).toBe(11);
  });

  test('Message with LF line break style and auto line break style detection', () => {
    const testMessage = '\nabcde\n\n123\n';
    const segmentedMessage = new SegmentedMessage(testMessage);
    expect(segmentedMessage.numberOfCharacters).toBe(12);
  });

  // Tests for https://github.com/TwilioDevEd/message-segment-calculator/issues/67
  test('lineBreakStyle is undefined when there are no line breaks', () => {
    expect(new SegmentedMessage('abcde').lineBreakStyle).toBeUndefined();
  });

  test('lineBreakStyle is LF for messages with only Unix line breaks', () => {
    expect(new SegmentedMessage('abc\ndef').lineBreakStyle).toBe('LF');
  });

  test('lineBreakStyle is CRLF for messages with only Windows line breaks', () => {
    expect(new SegmentedMessage('abc\r\ndef').lineBreakStyle).toBe('CRLF');
  });

  test('lineBreakStyle is LF+CRLF for messages that mix both styles', () => {
    expect(new SegmentedMessage('abc\r\ndef\nghi').lineBreakStyle).toBe('LF+CRLF');
  });

  // Real-world case (via PR #52): the same message costs an extra segment with
  // CRLF because each \r\n counts as 2 characters, pushing it over 160.
  test('Real-world message: CRLF bills 2 segments, LF bills 1', () => {
    const crlf =
      "Ce weekend c'est Big Kiff ! Découvrez vite 4 nouveaux menus à partager:\r\nl.dominos.fr/MqGKjT0Vi2\r\nConditions sur le site Domino's.\r\nSTOP : l.dominos.fr/oIv05Yymdm";
    const lf = crlf.replace(/\r\n/g, '\n');

    const crlfMessage = new SegmentedMessage(crlf);
    expect(crlfMessage.lineBreakStyle).toBe('CRLF');
    expect(crlfMessage.numberOfCharacters).toBe(162);
    expect(crlfMessage.segmentsCount).toBe(2);

    const lfMessage = new SegmentedMessage(lf);
    expect(lfMessage.lineBreakStyle).toBe('LF');
    expect(lfMessage.numberOfCharacters).toBe(159);
    expect(lfMessage.segmentsCount).toBe(1);
  });

  test('Triple accents characters - Unicode test', () => {
    const testMessage = 'é́́';
    const segmentedMessage = new SegmentedMessage(testMessage);
    expect(segmentedMessage.numberOfCharacters).toBe(1);
    expect(segmentedMessage.numberOfUnicodeScalars).toBe(4);
  });

  // Test for https://github.com/TwilioDevEd/message-segment-calculator/issues/17
  test('Triple accents characters - One Segment test', () => {
    const testMessage = 'é́́aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
    const segmentedMessage = new SegmentedMessage(testMessage);
    expect(segmentedMessage.segmentsCount).toBe(1);
  });

  test('Triple accents characters - Two Segments test', () => {
    const testMessage = 'é́́aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
    const segmentedMessage = new SegmentedMessage(testMessage);
    expect(segmentedMessage.segmentsCount).toBe(2);
  });
});
