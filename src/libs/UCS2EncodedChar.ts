import EncodedChar from './EncodedChar';

/*
 * Represent a UCS-2 encoded character
 * UCS-2 is of fixed length and requires 2 code units per character
 * a UCS-2 code unit is an octet (8bits)
 */
class UCS2EncodedChar extends EncodedChar {
  constructor(char: string, graphemeSize: number = 1) {
    super(char);
    this.graphemeSize = graphemeSize === undefined ? 1 : graphemeSize;

    if (char.length === 2) {
      this.codeUnits = [char.charCodeAt(0), char.charCodeAt(1)];
    } else {
      this.codeUnits = [char.charCodeAt(0)];
    }
  }

  static codeUnitSizeInBits(): number {
    return 16; // UCS-2 code units are 8bits long
  }

  sizeInBits(): number {
    return 16 * this.raw.length;
  }
}

export default UCS2EncodedChar;
