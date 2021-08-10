import EncodedChar from './EncodedChar';
import UnicodeToGsm from './UnicodeToGSM';

/*
 * Represent a GSM-7 encoded character
 * GSM-7 is of variable length and requires 1 or 2 code units per character
 * a GSM-7 code unit is a septet (7bits)
 */
class GSM7EncodedChar extends EncodedChar {
  constructor(char: string) {
    super(char);
    this.graphemeSize = 1;
    if (char.length === 1) {
      this.codeUnits = UnicodeToGsm[char.charCodeAt(0)];
    }
  }

  static codeUnitSizeInBits(): number {
    return 7; // GSM-7 code units are 7bits long
  }

  sizeInBits(): number {
    if (this.codeUnits) {
      return this.codeUnits.length * 7; // GSM-7 can be composed of 1 or 2 code units
    }
    return 0; // Some characters do not exist in GSM-7 thus making their length 0
  }
}

export default GSM7EncodedChar;
