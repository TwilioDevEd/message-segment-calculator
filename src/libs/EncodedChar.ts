import { UnicodeToGsm } from './UnicodeToGSM';

/**
 * Encoded Character Classes
 * Utility classes to represent a character in a given encoding.
 */

class EncodedChar {
  // Raw character (grapheme) as passed in the constructor
  raw: string;

  // Array of 8 bits number rapresenting the encoded character
  codeUnits: number[];

  // True if the character is a GSM7 one
  isGSM7: boolean;

  // Which encoding to use for this char
  encoding: 'GSM-7' | 'UCS-2';

  constructor(char: string, encoding: 'GSM-7' | 'UCS-2') {
    this.raw = char;
    this.encoding = encoding;
    this.isGSM7 = Boolean(char && char.length === 1 && UnicodeToGsm[char.charCodeAt(0)]);
    if (this.isGSM7) {
      this.codeUnits = UnicodeToGsm[char.charCodeAt(0)];
    } else {
      this.codeUnits = [];
      for (let i = 0; i < char.length; i++) {
        this.codeUnits.push(char.charCodeAt(i));
      }
    }
  }

  codeUnitSizeInBits(): number {
    return this.encoding === 'GSM-7' ? 7 : 8;
  }

  sizeInBits(): number {
    if (this.encoding === 'UCS-2' && this.isGSM7) {
      // GSM characters are always using 16 bits in UCS-2 encoding
      return 16;
    }
    const bitsPerUnits = this.encoding === 'GSM-7' ? 7 : 16;
    return bitsPerUnits * this.codeUnits.length;
  }
}

export default EncodedChar;
