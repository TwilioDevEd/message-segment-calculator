import GraphemeSplitter from 'grapheme-splitter';

import UCS2EncodedChar from './libs/UCS2EncodedChar';
import GSM7EncodedChar from './libs/GSM7EncodedChar';
import Segment from './libs/Segment';

type SmsEncoding = 'GSM-7' | 'UCS-2';

type EncodedChars = Array<UCS2EncodedChar> | Array<GSM7EncodedChar>;

const validEncodingValues = ['GSM-7', 'UCS-2', 'auto'];
/*
 * interface smsSegmentsInfo {
 *   messageBodyText: string;
 *   encoding: SmsEncoding;
 *   segments: number;
 *   encodedBodyText: any;
 * }
 */

/**
 *
 * Parse a message and build the segments based on the chosen encoding.
 *
 */
// eslint-disable-next-line import/no-unused-modules
export class SegmentedMessage {
  CharClass: typeof UCS2EncodedChar | typeof GSM7EncodedChar;

  encoding: SmsEncoding | 'auto';

  segments: any;

  graphemes: string[];

  encodingName: SmsEncoding;

  constructor(message: string, encoding: SmsEncoding | 'auto' = 'auto') {
    const splitter = new GraphemeSplitter();

    if (!validEncodingValues.includes(encoding)) {
      throw new Error(
        `Encoding ${encoding} not supported. Valid values for encoding are ${validEncodingValues.join(', ')}`,
      );
    }

    this.graphemes = splitter.splitGraphemes(message);
    this.encoding = encoding;

    if (this.hasAnyUCSCharacters(this.graphemes)) {
      if (encoding === 'GSM-7') {
        throw new Error('The string provided is incompatible with GSM-7 encoding');
      }
      this.CharClass = UCS2EncodedChar;
      this.encodingName = 'UCS-2';
    } else {
      this.CharClass = GSM7EncodedChar;
      this.encodingName = 'GSM-7';
    }

    const encodedChars: EncodedChars = this.encodeChars(this.graphemes);
    this.segments = this.buildSegments(encodedChars);
  }

  hasAnyUCSCharacters(graphemes: string[]): boolean {
    let result = false;
    for (const grapheme of graphemes) {
      if (grapheme.length >= 2) {
        result = true;
        break;
      }
    }
    return result;
  }

  buildSegments(encodedChars: EncodedChars, useTwilioReservedBits: boolean = false): Segment[] {
    const segments: Segment[] = [];
    const hasTwilioReservedBits = useTwilioReservedBits === true;
    let currentSegment = null;

    for (const encodedChar of encodedChars) {
      if (currentSegment === null || currentSegment.freeSizeInBits() < encodedChar.sizeInBits()) {
        if (currentSegment && hasTwilioReservedBits === false) {
          return this.buildSegments(encodedChars, true);
        }

        currentSegment = new Segment(hasTwilioReservedBits);
        segments.push(currentSegment);
      }
      currentSegment.push(encodedChar);
    }

    return segments;
  }

  getEncodingName(): string {
    return this.encodingName;
  }

  encodeChars(graphemes: string[]): EncodedChars {
    const encodedChars: EncodedChars = [];

    for (const grapheme of graphemes) {
      if (grapheme.length <= 2) {
        encodedChars.push(new this.CharClass(grapheme));
      } else {
        const parts = [...grapheme];
        for (let i = 0; i < parts.length; i++) {
          encodedChars.push(new this.CharClass(parts[i], i === 0 ? parts.length : 0));
        }
      }
    }
    return encodedChars;
  }

  get totalSize(): number {
    let size = 0;
    for (const segment of this.segments) {
      size += segment.sizeInBits();
    }
    return size;
  }

  get messageSize(): number {
    let size = 0;
    for (const segment of this.segments) {
      size += segment.messageSizeInBits();
    }
    return size;
  }
}

// eslint-disable-next-line import/no-unused-modules
// export default SegmentedMessage;
