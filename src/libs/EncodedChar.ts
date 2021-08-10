import UnicodeToGsm from './UnicodeToGSM';

/**
 * Encoded Character Classes
 * Utility classes to represent a character in a given encoding.
 */

class EncodedChar {
  raw: string;

  graphemeSize: number | undefined;

  codeUnits: number[] | undefined;

  isGSM7: boolean;

  constructor(char: string) {
    this.raw = char;
    this.isGSM7 = Boolean(char && UnicodeToGsm[char.charCodeAt(0)]);
  }
}

export default EncodedChar;
