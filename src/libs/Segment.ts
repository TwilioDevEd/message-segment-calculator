import TwilioReservedChar from './TwilioReservedChar';

/**
 * Segment Class
 * A modified array representing one segment and add some helper functions
 */

class Segment extends Array {
  hasTwilioReservedBits: boolean;

  constructor(hasTwilioReservedBits: boolean) {
    super();
    this.hasTwilioReservedBits = hasTwilioReservedBits;
    if (this.hasTwilioReservedBits) {
      for (let i = 0; i < 6; i++) {
        this.push(new TwilioReservedChar(''));
      }
    }
    // TODO: Refactor this. Bad practice to extends basic types
    Object.setPrototypeOf(this, Object.create(Segment.prototype));
  }

  sizeInBits(): number {
    return this.reduce((accumulator: number, encodedChar: Segment) => accumulator + encodedChar.sizeInBits(), 0);
  }

  messageSizeInBits(): number {
    return this.reduce(
      (accumulator: number, encodedChar: Segment) =>
        accumulator + (encodedChar instanceof TwilioReservedChar ? 0 : encodedChar.sizeInBits()),
      0,
    );
  }

  freeSizeInBits(): number {
    const maxBitsInSegment = 1120; // max size of a SMS is 140 octets -> 140 * 8bits = 1120 bits
    return maxBitsInSegment - this.sizeInBits();
  }
}

export default Segment;
