import Segment from './Segment';
import EncodedChar from './EncodedChar';
declare type SmsEncoding = 'GSM-7' | 'UCS-2';
declare type EncodedChars = Array<EncodedChar>;
/**
 * Class representing a segmented SMS
 */
export declare class SegmentedMessage {
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
    constructor(message: string, encoding?: SmsEncoding | 'auto');
    /**
     * Internal method to check if the message has any non-GSM7 characters
     *
     * @param {string[]} graphemes Message body
     * @returns {boolean} True if there are non-GSM-7 characters
     * @private
     */
    _hasAnyUCSCharacters(graphemes: string[]): boolean;
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
     * Internal method to create an array of EncodedChar from a string
     *
     * @param {string[]} graphemes Array of graphemes representing the message
     * @returns {object[]} Array of EncodedChar
     * @private
     */
    _encodeChars(graphemes: string[]): EncodedChars;
    /**
     * @return {number} Total size of the message in bits (including User Data Header if present)
     */
    get totalSize(): number;
    /**
     * @return {number} Total size of the message in bits (excluding User Data Header if present)
     */
    get messageSize(): number;
    /**
     *
     * @return {number} Number of segments
     */
    get segmentsCount(): number;
}
export {};
