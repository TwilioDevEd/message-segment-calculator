import GraphemeSplitter from 'grapheme-splitter';

import Segment from './Segment';
import EncodedChar from './EncodedChar';

type SmsEncoding = 'GSM-7' | 'UCS-2';

type EncodedChars = Array<EncodedChar>;

const validEncodingValues = ['GSM-7', 'UCS-2', 'auto'];

export class SegmentedMessage {
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
      this.encodingName = 'UCS-2';
    } else {
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

  buildSegments(encodedChars: EncodedChars): Segment[] {
    const segments: Segment[] = [];
    segments.push(new Segment());
    let currentSegment = segments[0];

    for (const encodedChar of encodedChars) {
      if (currentSegment.freeSizeInBits() < encodedChar.sizeInBits()) {
        segments.push(new Segment(true));
        currentSegment = segments[segments.length - 1];
        const previousSegment = segments[segments.length - 2];

        if (!previousSegment.hasUserDataHeader) {
          const removedChars = previousSegment.addHeader();
          // eslint-disable-next-line no-loop-func
          removedChars.forEach((char) => currentSegment.push(char));
        }
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
      encodedChars.push(new EncodedChar(grapheme, this.encodingName));
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
