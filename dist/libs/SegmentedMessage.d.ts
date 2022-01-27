import Segment from './Segment';
import EncodedChar from './EncodedChar';
declare type SmsEncoding = 'GSM-7' | 'UCS-2';
declare type EncodedChars = Array<EncodedChar>;
declare type LineBreakStyle = 'LF' | 'CRLF';
/**
 * Class representing a segmented SMS
 */
export declare class SegmentedMessage {
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
    constructor(message: string, encoding?: SmsEncoding | 'auto', lineBreakStyle?: LineBreakStyle | 'auto');
    /**
     * Internal method to check if the message has any non-GSM7 characters
     *
     * @param {string[]} graphemes Message body
     * @returns {boolean} True if there are non-GSM-7 characters
     * @private
     */
    _hasAnyUCSCharacters(graphemes: string[]): boolean;
    /**
     * Internal method to check the line break styled used in the passed message
     *
     * @param {string} message Message body
     * @returns {LineBreakStyle} The libre break style name LF or CRLF
     * @private
     */
    _detectLineBreakStyle(message: string): LineBreakStyle;
    /**
     * Internal method to replace break lines
     *
     * @param {string} message Message body
     * @returns {string} Message body with required line break replacements
     * @private
     */
    _replaceLineBreakStyle(message: string): string;
    /**
     * Internal method used to build message's segment(s)
     *
     * @param {object[]} encodedChars Array of EncodedChar
     * @returns {object[]} Array of Segment
     * @private
     */
    _buildSegments(encodedChars: EncodedChars): Segment[];
    /**
     * Return the encoding of the message segment
     *
     * @returns {string} Encoding for the message segment(s)
     */
    getEncodingName(): string;
    /**
     * Return the line break style of the message segment
     *
     * @returns {string} Line break style for the message segment(s)
     */
    getLineBreakStyleName(): string;
    /**
     * Internal method to create an array of EncodedChar from a string
     *
     * @param {string[]} graphemes Array of graphemes representing the message
     * @returns {object[]} Array of EncodedChar
     * @private
     */
    _encodeChars(graphemes: string[]): EncodedChars;
    /**
     * Internal method to count the total number of code units of the message
     *
     * @param {EncodedChar[]} encodedChars Encoded message body
     * @returns {number} The total number of code units
     * @private
     */
    _countCodeUnits(encodedChars: EncodedChar[]): number;
    /**
     * @returns {number} Total size of the message in bits (including User Data Header if present)
     */
    get totalSize(): number;
    /**
     * @returns {number} Total size of the message in bits (excluding User Data Header if present)
     */
    get messageSize(): number;
    /**
     *
     * @returns {number} Number of segments
     */
    get segmentsCount(): number;
    /**
     *
     * @returns {string[]} Array of characters representing the non GSM-7 characters in the message body
     */
    getNonGsmCharacters(): string[];
}
export {};
