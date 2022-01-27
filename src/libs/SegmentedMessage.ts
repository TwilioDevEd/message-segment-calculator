import GraphemeSplitter from 'grapheme-splitter';

import Segment from './Segment';
import EncodedChar from './EncodedChar';
import UnicodeToGsm from './UnicodeToGSM';

type SmsEncoding = 'GSM-7' | 'UCS-2';

type EncodedChars = Array<EncodedChar>;

type LineBreakStyle = 'LF' | 'CRLF';

const validEncodingValues = ['GSM-7', 'UCS-2', 'auto'];
const validLineBreakStyleValues = ['LF', 'CRLF', 'auto'];

/**
 * Class representing a segmented SMS
 */
export class SegmentedMessage {
  encoding: SmsEncoding | 'auto';

  message: string;

  lineBreakStyleName: LineBreakStyle;

  segments: Segment[];

  graphemes: string[];

  encodingName: SmsEncoding;

  numberOfUnicodeScalars: number;

  numberOfCharacters: number;

  encodedChars: EncodedChars;

  /**
   *
   * Create a new segmented message from a string
   *
   * @param {string} message Body of the message
   * @param {boolean} [encoding] Optional: encoding. It can be 'GSM-7', 'UCS-2', 'auto'. Default value: 'auto'
   * @param {string} [lineBreakStyle] Optional: lineBreakStyle. It can be 'LF', 'CRLF', auto. Default value: 'auto'
   * @property {number} numberOfUnicodeScalars  Number of Unicode Scalars (i.e. unicode pairs) the message is made of
   *
   */
  constructor(
    message: string,
    encoding: SmsEncoding | 'auto' = 'auto',
    lineBreakStyle: LineBreakStyle | 'auto' = 'auto',
  ) {
    const splitter = new GraphemeSplitter();

    if (!validEncodingValues.includes(encoding)) {
      throw new Error(
        `Encoding ${encoding} not supported. Valid values for encoding are ${validEncodingValues.join(', ')}`,
      );
    }

    if (!validLineBreakStyleValues.includes(lineBreakStyle)) {
      throw new Error(
        `Line break style ${encoding} not supported. Valid values for line break srtyle are ${validLineBreakStyleValues.join(
          ', ',
        )}`,
      );
    }

    /**
     * @property {string} lineBreakStyleName Line break style name used in the message
     */
    this.lineBreakStyleName = lineBreakStyle === 'auto' ? this._detectLineBreakStyle(message) : lineBreakStyle;
    /**
     * @property {string} message Message to calculate segments and bit size
     */
    this.message = this._replaceLineBreakStyle(message);
    /**
     * @property {string[]} graphemes Graphemes (array of strings) the message have been split into
     */
    this.graphemes = splitter.splitGraphemes(this.message).reduce((accumulator: string[], grapheme: string) => {
      const result = grapheme === '\r\n' ? grapheme.split('') : [grapheme];
      return accumulator.concat(result);
    }, []);
    /**
     * @property {number} numberOfUnicodeScalars  Number of Unicode Scalars (i.e. unicode pairs) the message is made of
     * Some characters (e.g. extended emoji) can be made of more than one unicode pair
     */
    this.numberOfUnicodeScalars = [...this.message].length;
    /**
     * @property {string} encoding Encoding set in the constructor for the message. Allowed values: 'GSM-7', 'UCS-2', 'auto'.
     * @private
     */
    this.encoding = encoding;

    if (this.encoding === 'auto') {
      /**
       * @property {string} encodingName Calculated encoding name. It can be: "GSM-7" or "UCS-2"
       */
      this.encodingName = this._hasAnyUCSCharacters(this.graphemes) ? 'UCS-2' : 'GSM-7';
    } else {
      if (encoding === 'GSM-7' && this._hasAnyUCSCharacters(this.graphemes)) {
        throw new Error('The string provided is incompatible with GSM-7 encoding');
      }
      this.encodingName = this.encoding;
    }

    /**
     * @property {string[]} encodedChars Array of encoded characters composing the message
     */
    this.encodedChars = this._encodeChars(this.graphemes);

    /**
     * @property {number} numberOfCharacters Number of characters in the message. Each character count as 1 except for
     * the characters in the GSM extension character set.
     */
    this.numberOfCharacters =
      this.encodingName === 'UCS-2' ? this.graphemes.length : this._countCodeUnits(this.encodedChars);

    /**
     * @property {object[]} segments Array of segment(s) the message have been segmented into
     */
    this.segments = this._buildSegments(this.encodedChars);
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
   * Internal method to check the line break styled used in the passed message
   *
   * @param {string} message Message body
   * @returns {LineBreakStyle} The libre break style name LF or CRLF
   * @private
   */
  _detectLineBreakStyle(message: string): LineBreakStyle {
    const lfCount = message.split(/(?<!\r)\n/gi).length;
    const crlfCount = message.split(/\r\n/gi).length;
    if (lfCount > 1 && crlfCount > 1) {
      throw new Error('Multiple linebreak styles detected, please use a single line break style');
    }
    return crlfCount > 1 ? 'CRLF' : 'LF';
  }

  /**
   * Internal method to replace break lines
   *
   * @param {string} message Message body
   * @returns {string} Message body with required line break replacements
   * @private
   */
  _replaceLineBreakStyle(message: string): string {
    const isLineBreakEqualToName = this.lineBreakStyleName === this._detectLineBreakStyle(message);
    if (isLineBreakEqualToName) {
      return message;
    }
    return this.lineBreakStyleName === 'LF' ? message.replace(/\r\n/gi, '\n') : message.replace(/\n/gi, '\r\n');
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
   * Return the line break style of the message segment
   *
   * @returns {string} Line break style for the message segment(s)
   */
  getLineBreakStyleName(): string {
    return this.lineBreakStyleName;
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
   * Internal method to count the total number of code units of the message
   *
   * @param {EncodedChar[]} encodedChars Encoded message body
   * @returns {number} The total number of code units
   * @private
   */
  _countCodeUnits(encodedChars: EncodedChar[]): number {
    return encodedChars.reduce(
      (acumulator: number, nextEncodedChar: EncodedChar) => acumulator + nextEncodedChar.codeUnits.length,
      0,
    );
  }

  /**
   * @returns {number} Total size of the message in bits (including User Data Header if present)
   */
  get totalSize(): number {
    let size = 0;
    for (const segment of this.segments) {
      size += segment.sizeInBits();
    }
    return size;
  }

  /**
   * @returns {number} Total size of the message in bits (excluding User Data Header if present)
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
   * @returns {number} Number of segments
   */
  get segmentsCount(): number {
    return this.segments.length;
  }

  /**
   *
   * @returns {string[]} Array of characters representing the non GSM-7 characters in the message body
   */
  getNonGsmCharacters(): string[] {
    return this.encodedChars.filter((encodedChar) => !encodedChar.isGSM7).map((encodedChar) => encodedChar.raw);
  }
}
