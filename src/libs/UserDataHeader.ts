/*
 * Represent a User Data Header https://en.wikipedia.org/wiki/User_Data_Header
 * Twilio messages reserve 6 of this per segment in a concatenated message
 */

class UserDataHeader {
  isReservedChar: boolean;

  isUserDataHeader: boolean;

  constructor() {
    this.isReservedChar = true;
    this.isUserDataHeader = true;
  }

  static codeUnitSizeInBits(): number {
    return 8;
  }

  sizeInBits(): number {
    return 8;
  }
}

export default UserDataHeader;
