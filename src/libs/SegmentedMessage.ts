import GraphemeSplitter from 'grapheme-splitter';

import Segment from './Segment';
import EncodedChar from './EncodedChar';
import { UnicodeToGsm, UnicodeToGsmMY } from './UnicodeToGSM';
import SmartEncodingMap from './SmartEncodingMap';

type SmsEncoding = 'GSM-7' | 'UCS-2';

type EncodedChars = Array<EncodedChar>;

const validEncodingValues = ['GSM-7', 'UCS-2', 'auto'];

declare type LineBreakStyle = 'LF' | 'CRLF' | 'LF+CRLF' | undefined;

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

  encodedChars: EncodedChars;

  lineBreakStyle: LineBreakStyle;

  warnings: string[];

  /**
   *
   * Create a new segmented message from a string
   *
   * @param {string} message Body of the message
   * @param {boolean} [encoding] Optional: encoding. It can be 'GSM-7', 'UCS-2', 'auto'. Default value: 'auto'
   * @param {boolean} smartEncoding Optional: whether or not Twilio's [Smart Encoding](https://www.twilio.com/docs/messaging/services#smart-encoding) is emulated. Default value: false
   * @param {string} countryCode Optional: whether to follow Malaysian encoding rules. Default value: 'US'
   * @property {number} numberOfUnicodeScalars  Number of Unicode Scalars (i.e. unicode pairs) the message is made of
   *
   */
  constructor(
    message: string,
    encoding: SmsEncoding | 'auto' = 'auto',
    smartEncoding: boolean = false,
    countryCode: string = 'US',
  ) {
    const splitter = new GraphemeSplitter();

    if (!validEncodingValues.includes(encoding)) {
      throw new Error(
        `Encoding ${encoding} not supported. Valid values for encoding are ${validEncodingValues.join(', ')}`,
      );
    }

    if (smartEncoding) {
      message = [...message]
        .map<string>((char) => (SmartEncodingMap[char] === undefined ? char : SmartEncodingMap[char]))
        .join('');
    }

    /**
     * @property {string[]} graphemes Graphemes (array of strings) the message have been split into
     */
    this.graphemes = splitter.splitGraphemes(message).reduce((accumulator: string[], grapheme: string) => {
      const result = grapheme === '\r\n' ? grapheme.split('') : [grapheme];
      return accumulator.concat(result);
    }, []);
    /**
     * @property {number} numberOfUnicodeScalars  Number of Unicode Scalars (i.e. unicode pairs) the message is made of
     * Some characters (e.g. extended emoji) can be made of more than one unicode pair
     */
    this.numberOfUnicodeScalars = [...message].length;
    /**
     * @property {string} encoding Encoding set in the constructor for the message. Allowed values: 'GSM-7', 'UCS-2', 'auto'.
     * @private
     */
    this.encoding = encoding;

    if (this.encoding === 'auto') {
      /**
       * @property {string} encodingName Calculated encoding name. It can be: "GSM-7" or "UCS-2"
       */
      this.encodingName = this._hasAnyUCSCharacters(this.graphemes, countryCode) ? 'UCS-2' : 'GSM-7';
    } else {
      if (encoding === 'GSM-7' && this._hasAnyUCSCharacters(this.graphemes, countryCode)) {
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

    /**
     * @property {LineBreakStyle} lineBreakStyle message line break style
     */
    this.lineBreakStyle = this._detectLineBreakStyle(message);

    /**
     * @property {string[]} warnings message line break style
     */
    this.warnings = this._checkForWarnings();
  }

  /**
   * Internal method to check if the message has any non-GSM7 characters
   *
   * @param {string[]} graphemes Message body
   * @returns {boolean} True if there are non-GSM-7 characters
   * @private
   */
  _hasAnyUCSCharacters(graphemes: string[], countryCode: string): boolean {
    let result = false;
    let uniCodeArr: Record<string, Array<number>> = {};

    if (countryCode === 'MY') {
      uniCodeArr = UnicodeToGsmMY;
    } else {
      uniCodeArr = UnicodeToGsm;
    }

    for (const grapheme of graphemes) {
      if (grapheme.length >= 2 || (grapheme.length === 1 && !uniCodeArr[grapheme.charCodeAt(0)])) {
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

  /**
   * Internal method to check the line break styled used in the passed message
   *
   * @param {string} message Message body
   * @returns {LineBreakStyle} The libre break style name LF or CRLF
   * @private
   */
  _detectLineBreakStyle(message: string): LineBreakStyle {
    const hasWindowsStyle = message.includes('\r\n');
    const HasUnixStyle = message.includes('\n');
    const mixedStyle = hasWindowsStyle && HasUnixStyle;
    const noBreakLine = !hasWindowsStyle && !HasUnixStyle;

    if (noBreakLine) {
      return undefined;
    }
    if (mixedStyle) {
      return 'LF+CRLF';
    }
    return HasUnixStyle ? 'LF' : 'CRLF';
  }

  /**
   * Internal method to check the line break styled used in the passed message
   *
   * @returns {string[]} The libre break style name LF or CRLF
   * @private
   */
  _checkForWarnings(): string[] {
    const warnings = [];
    if (this.lineBreakStyle) {
      warnings.push(
        'The message has line breaks, the web page utility only supports LF style. If you insert a CRLF it will be converted to LF.',
      );
    }
    return warnings;
  }
}
