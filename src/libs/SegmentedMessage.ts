import GraphemeSplitter from 'grapheme-splitter';

import Segment from './Segment';
import EncodedChar from './EncodedChar';
import UnicodeToGsm from './UnicodeToGSM';

type SmsEncoding = 'GSM-7' | 'UCS-2';

type EncodedChars = Array<EncodedChar>;

const validEncodingValues = ['GSM-7', 'UCS-2', 'auto'];

/**
 * Class representing a segmented SMS
 */
export class SegmentedMessage {
  encoding: SmsEncoding | 'auto';

  segments: Segment[];

  graphemes: string[];

  encodingName: SmsEncoding;

  numberOfUnicodeScalars: number;

  numberOfCharacters: number;

  /**
   *
   * Create a new segmented message from a string
   *
   * @param {string} message Body of the message
   * @param {boolean} [encoding] Optional: encoding. It can be 'GSM-7', 'UCS-2', 'auto'. Default value: 'auto'
   * @property {number} numberOfUnicodeScalars  Number of Unicode Scalars (i.e. unicode pairs) the message is made of
   *
   */
  constructor(message: string, encoding: SmsEncoding | 'auto' = 'auto') {
    const splitter = new GraphemeSplitter();

    if (!validEncodingValues.includes(encoding)) {
      throw new Error(
        `Encoding ${encoding} not supported. Valid values for encoding are ${validEncodingValues.join(', ')}`,
      );
    }

    /**
     * @property {string[]} graphemes Graphemes (array of strings) the message have been split into
     */
    this.graphemes = splitter.splitGraphemes(message);
    /**
     * @property {number} numberOfUnicodeScalars  Number of Unicode Scalars (i.e. unicode pairs) the message is made of
     * Some characters (e.g. extended emoji) can be made of more than one unicode pair
     */
    this.numberOfUnicodeScalars = [...message].length;
    /**
     * @property {number} numberOfCharacters Number of characters in the message. Each character count as 1, regardless of the encoding.
     */
    this.numberOfCharacters = this.graphemes.length;
    /**
     * @property {string} encoding Encoding set in the constructor for the message. Allowed values: 'GSM-7', 'UCS-2', 'auto'.
     * @private
     */
    this.encoding = encoding;

    if (this._hasAnyUCSCharacters(this.graphemes)) {
      if (encoding === 'GSM-7') {
        throw new Error('The string provided is incompatible with GSM-7 encoding');
      }
      /**
       * @property {string} encodingName Calculated encoding name. It can be: "GSM-7" or "UCS-2"
       */
      this.encodingName = 'UCS-2';
    } else {
      this.encodingName = 'GSM-7';
    }

    const encodedChars: EncodedChars = this._encodeChars(this.graphemes);
    /**
     * @property {object[]} segments Array of segment(s) the message have been segmented into
     */
    this.segments = this._buildSegments(encodedChars);
  }

  /**
   * Internal method to check if the message has any non-GSM7 characters
   *
   * @param {string[]} graphemes Message body
   * @returns {boolean} True if there are non-GSM-7 characters
   * @private
   */
  _hasAnyUCSCharacters(graphemes: string[]): boolean {
    let result = false;
    for (const grapheme of graphemes) {
      if (grapheme.length >= 2 || (grapheme.length === 1 && !UnicodeToGsm[grapheme.charCodeAt(0)])) {
        result = true;
        break;
      }
    }
    return result;
  }

  /**
   * Internal method used to build message's segment(s)
   *
   * @param {object[]} encodedChars Array of EncodedChar
   * @returns {object[]} Array of Segment
   * @private
   */

  _buildSegments(encodedChars: EncodedChars): Segment[] {
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

  /**
   * Return the encoding of the message segment
   *
   * @returns {string} Encoding for the message segment(s)
   */
  getEncodingName(): string {
    return this.encodingName;
  }

  /**
   * Internal method to create an array of EncodedChar from a string
   *
   * @param {string[]} graphemes Array of graphemes representing the message
   * @returns {object[]} Array of EncodedChar
   * @private
   */
  _encodeChars(graphemes: string[]): EncodedChars {
    const encodedChars: EncodedChars = [];

    for (const grapheme of graphemes) {
      encodedChars.push(new EncodedChar(grapheme, this.encodingName));
    }
    return encodedChars;
  }

  /**
   * @return {number} Total size of the message in bits (including User Data Header if present)
   */
  get totalSize(): number {
    let size = 0;
    for (const segment of this.segments) {
      size += segment.sizeInBits();
    }
    return size;
  }

  /**
   * @return {number} Total size of the message in bits (excluding User Data Header if present)
   */
  get messageSize(): number {
    let size = 0;
    for (const segment of this.segments) {
      size += segment.messageSizeInBits();
    }
    return size;
  }

  /**
   *
   * @return {number} Number of segments
   */
  get segmentsCount(): number {
    return this.segments.length;
  }
}
