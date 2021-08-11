import UserDataHeader from './UserDataHeader';
import EncodedChar from './EncodedChar';

/**
 * Segment Class
 * A modified array representing one segment and add some helper functions
 */

class Segment extends Array {
  hasTwilioReservedBits: boolean;

  hasUserDataHeader: boolean;

  constructor(withUserDataHeader: boolean = false) {
    super();
    // TODO: Refactor this. Bad practice to extend basic types
    Object.setPrototypeOf(this, Object.create(Segment.prototype));
    this.hasTwilioReservedBits = withUserDataHeader;
    this.hasUserDataHeader = withUserDataHeader;
    if (withUserDataHeader) {
      for (let i = 0; i < 6; i++) {
        this.push(new UserDataHeader());
      }
    }
  }

  // Size in bits *including* User Data Header (if present)
  sizeInBits(): number {
    return this.reduce((accumulator: number, encodedChar: Segment) => accumulator + encodedChar.sizeInBits(), 0);
  }

  // Size in bits *excluding* User Data Header (if present)
  messageSizeInBits(): number {
    return this.reduce(
      (accumulator: number, encodedChar: Segment) =>
        accumulator + (encodedChar instanceof UserDataHeader ? 0 : encodedChar.sizeInBits()),
      0,
    );
  }

  freeSizeInBits(): number {
    const maxBitsInSegment = 1120; // max size of a SMS is 140 octets -> 140 * 8bits = 1120 bits
    return maxBitsInSegment - this.sizeInBits();
  }

  addHeader(): EncodedChar[] {
    if (this.hasUserDataHeader) {
      return [];
    }
    const leftOverChar: EncodedChar[] = [];
    this.hasTwilioReservedBits = true;
    this.hasUserDataHeader = false;
    for (let i = 0; i < 6; i++) {
      this.unshift(new UserDataHeader());
    }
    // Remove characters
    while (this.freeSizeInBits() < 0) {
      leftOverChar.unshift(this.pop());
    }
    return leftOverChar;
  }
}

export default Segment;
