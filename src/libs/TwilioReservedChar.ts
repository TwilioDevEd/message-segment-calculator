import EncodedChar from './EncodedChar';

/*
 * Represent a Twilio reserved octet
 * Twilio messages reserve 6 of this per segment
 */
class TwilioReservedChar extends EncodedChar {
  isReservedChar: boolean;

  constructor(char: string) {
    super(char);
    this.isReservedChar = true;
  }

  static codeUnitSizeInBits(): number {
    return 8;
  }

  sizeInBits(): number {
    return 8;
  }
}

export default TwilioReservedChar;
