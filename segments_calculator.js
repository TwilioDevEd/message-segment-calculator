/* In order to avoid confusion here is a list of terms 
 * used throughout this code:
 * - octet: represent a byte or 8bits
 * - septet: represent 7bits
 * - character: a text unit, think one char is one glyph (Warning: this is an oversimplification and not always true)
 * - code point: a character value in a given encoding
 * - code unit: a single "block" used to encode a character
 *              UCS-2 is of fixed length and every character is 2 code units long
 *              GSM-7 is of variable length and require 1 or 2 code unit per character
 */


// Map of Javascript code points to GSM-7 
const unicodeToGsm = {
    0x000A: [0x0A],
    0x000C: [0x1B, 0x0A],
    0x000D: [0x0D],
    0x0020: [0x20],
    0x0021: [0x21],
    0x0022: [0x22],
    0x0023: [0x23],
    0x0024: [0x02],
    0x0025: [0x25],
    0x0026: [0x26],
    0x0027: [0x27],
    0x0028: [0x28],
    0x0029: [0x29],
    0x002A: [0x2A],
    0x002B: [0x2B],
    0x002C: [0x2C],
    0x002D: [0x2D],
    0x002E: [0x2E],
    0x002F: [0x2F],
    0x0030: [0x30],
    0x0031: [0x31],
    0x0032: [0x32],
    0x0033: [0x33],
    0x0034: [0x34],
    0x0035: [0x35],
    0x0036: [0x36],
    0x0037: [0x37],
    0x0038: [0x38],
    0x0039: [0x39],
    0x003A: [0x3A],
    0x003B: [0x3B],
    0x003C: [0x3C],
    0x003D: [0x3D],
    0x003E: [0x3E],
    0x003F: [0x3F],
    0x0040: [0x00],
    0x0041: [0x41],
    0x0042: [0x42],
    0x0043: [0x43],
    0x0044: [0x44],
    0x0045: [0x45],
    0x0046: [0x46],
    0x0047: [0x47],
    0x0048: [0x48],
    0x0049: [0x49],
    0x004A: [0x4A],
    0x004B: [0x4B],
    0x004C: [0x4C],
    0x004D: [0x4D],
    0x004E: [0x4E],
    0x004F: [0x4F],
    0x0050: [0x50],
    0x0051: [0x51],
    0x0052: [0x52],
    0x0053: [0x53],
    0x0054: [0x54],
    0x0055: [0x55],
    0x0056: [0x56],
    0x0057: [0x57],
    0x0058: [0x58],
    0x0059: [0x59],
    0x005A: [0x5A],
    0x005B: [0x1B, 0x3C],
    0x005C: [0x1B, 0x2F],
    0x005D: [0x1B, 0x3E],
    0x005E: [0x1B, 0x14],
    0x005F: [0x11],
    0x0061: [0x61],
    0x0062: [0x62],
    0x0063: [0x63],
    0x0064: [0x64],
    0x0065: [0x65],
    0x0066: [0x66],
    0x0067: [0x67],
    0x0068: [0x68],
    0x0069: [0x69],
    0x006A: [0x6A],
    0x006B: [0x6B],
    0x006C: [0x6C],
    0x006D: [0x6D],
    0x006E: [0x6E],
    0x006F: [0x6F],
    0x0070: [0x70],
    0x0071: [0x71],
    0x0072: [0x72],
    0x0073: [0x73],
    0x0074: [0x74],
    0x0075: [0x75],
    0x0076: [0x76],
    0x0077: [0x77],
    0x0078: [0x78],
    0x0079: [0x79],
    0x007A: [0x7A],
    0x007B: [0x1B, 0x28],
    0x007C: [0x1B, 0x40],
    0x007D: [0x1B, 0x29],
    0x007E: [0x1B, 0x3D],
    0x00A1: [0x40],
    0x00A3: [0x01],
    0x00A4: [0x24],
    0x00A5: [0x03],
    0x00A7: [0x5F],
    0x00BF: [0x60],
    0x00C4: [0x5B],
    0x00C5: [0x0E],
    0x00C6: [0x1C],
    0x00C9: [0x1F],
    0x00D1: [0x5D],
    0x00D6: [0x5C],
    0x00D8: [0x0B],
    0x00DC: [0x5E],
    0x00DF: [0x1E],
    0x00E0: [0x7F],
    0x00E4: [0x7B],
    0x00E5: [0x0F],
    0x00E6: [0x1D],
    0x00C7: [0x09],
    0x00E8: [0x04],
    0x00E9: [0x05],
    0x00EC: [0x07],
    0x00F1: [0x7D],
    0x00F2: [0x08],
    0x00F6: [0x7C],
    0x00F8: [0x0C],
    0x00F9: [0x06],
    0x00FC: [0x7E],
    0x0393: [0x13],
    0x0394: [0x10],
    0x0398: [0x19],
    0x039B: [0x14],
    0x039E: [0x1A],
    0x03A0: [0x16],
    0x03A3: [0x18],
    0x03A6: [0x12],
    0x03A8: [0x17],
    0x03A9: [0x15],
    0x20AC: [0x1B, 0x65]
}


/*****************************************************************
 * Encoded Character Classes                                     *
 *                                                               *
 * Utility classes to represent a character in a given encoding. *
 *****************************************************************/

class EncodedChar {
  constructor(char) {
    this.raw = char;
    this.codeUnits = null;
    this.isGSM7 = char && unicodeToGsm[char.charCodeAt(0)] ? true : false;
  }

  sizeInBits() {
    return 0;
  }

  static codeUnitSizeInBits() {
    return undefined;
  }
}

// Represent a Twilio reserved octet
// Twilio messages reserve 6 of this per segment
class TwilioReservedChar extends EncodedChar {
  constructor(char) {
    super(null);
    this.codeUnits = null;
  }

  sizeInBits() {
    return 8;
  }

  static codeUnitSizeInBits() {
    return 8;
  }
}

// Represent a GSM-7 encoded character
// GSM-7 is of variable length and requires 1 or 2 code units per character
// a GSM-7 code unit is a septet (7bits)
class GSM7EncodedChar extends EncodedChar {
  constructor(char) {
    super(char);

    if (char.length === 1) {
      this.codeUnits = unicodeToGsm[char.charCodeAt(0)];
    }
  }

  static codeUnitSizeInBits() {
    return 7; // GSM-7 code units are 7bits long
  }


  sizeInBits() {
    if (this.codeUnits) {
      return this.codeUnits.length * 7; // GSM-7 can be composed of 1 or 2 code units
    } else {
      return 0; // Some characters do not exist in GSM-7 thus making their length 0
    }
  }
}


// Represent a UCS-2 encoded character
class UCS2EncodedChar extends EncodedChar {
  constructor(char, graphemeSize) {
    super(char);
    this.graphemeSize = graphemeSize === undefined ? 1 : graphemeSize;

    if (char.length === 2) {
      this.codeUnits = [char.charCodeAt(0), char.charCodeAt(1)];
    } else {
      this.codeUnits = [char.charCodeAt(0)];
    }
  }

  static codeUnitSizeInBits() {
    return 16;
  }

  sizeInBits() {
    return 16 * this.raw.length;
  }
}


/****************************************************************************
 * Segment Class                                                            *
 *                                                                          *
 * A modified array representing one segment and add some helper functions. *
 ****************************************************************************/

class Segment extends Array {
  constructor (hasTwilioReservedBits) {
    super();

    this.hasTwilioReservedBits = hasTwilioReservedBits;

    if (this.hasTwilioReservedBits) {
      for (let i = 0; i < 6; i++) {
        this.push(new TwilioReservedChar());
      }
    }
  }

  sizeInBits() {
    return this.reduce((accumulator, encodedChar) => accumulator + encodedChar.sizeInBits(), 0);
  }

  messageSizeInBits() {
    return this.reduce(
      (accumulator, encodedChar) => 
        accumulator + (encodedChar instanceof TwilioReservedChar ? 0 : encodedChar.sizeInBits()),
      0
    );
  }

  freeSizeInBits() {
    const maxBitsInSegment = 1120; // max size of a SMS is 140 octets -> 140 * 8bits = 1120 bits
    return maxBitsInSegment - this.sizeInBits();
  }
}


/***************************************************************************
 * Segmented Message Class                                                 *
 *                                                                         *
 * Parse a message and build the segments based on the chosen encoding.    *
 ***************************************************************************/

class SegmentedMessage {
  constructor(message, encoding, graphemeSplitter) {
    this.charClass = this.charClassForEncoding(encoding);
    this.encoding = encoding;
    this.splitter = graphemeSplitter;

    let encodedChars = this.encodeChars(message);
    if (encoding === "auto" && this.hasIncompatibleEncoding(encodedChars)) {
      this.charClass = UCS2EncodedChar;
      encodedChars = this.encodeChars(message);
    }

    this.segments = this.buildSegments(encodedChars);
  }

  buildSegments(encodedChars, useTwilioReservedBits) {
    let segments = [];
    const hasTwilioReservedBits = (useTwilioReservedBits === true);
    let currentSegment = null;

    for (const encodedChar of encodedChars) {
      if (currentSegment === null || currentSegment.freeSizeInBits() < encodedChar.sizeInBits()) {
        
        if (currentSegment && hasTwilioReservedBits === false) {
          return this.buildSegments(encodedChars, true);
        }

        currentSegment = new Segment(hasTwilioReservedBits);
        segments.push(currentSegment);
      }
      currentSegment.push(encodedChar);
    }

    return segments;
  }

  charClassForEncoding(encoding) {
    if (encoding === "GSM-7") {
      return GSM7EncodedChar;
    } else if (encoding === "UCS-2") {
      return UCS2EncodedChar;
    } else if (encoding === "auto") {
      return GSM7EncodedChar;
    } else {
      throw "Unsupported encoding";
    }
  }

  getEncodingName() {
    if (this.charClass === GSM7EncodedChar) {
      return "GSM-7";
    } else if (this.charClass === UCS2EncodedChar) {
      return "UCS-2";
    } else {
      return "Unkown";
    }
  }

  hasIncompatibleEncoding(encodedChars) {
    for (const encodedChar of encodedChars) {
      if (!encodedChar.codeUnits) {
        return true;
      }
    }
    return false;
  }

  encodeChars(message) {
    let encodedChars = [];
    for (const char of this.splitter.iterateGraphemes(message)) {
      if (char.length <= 2) {
        encodedChars.push(new this.charClass(char));
      } else {
        const parts = [...char];
        for (let i = 0; i < parts.length; i++) {
          encodedChars.push(new this.charClass(parts[i], (i===0?parts.length:0)));
        }
      }
    }
    return encodedChars;
  }

  get totalSize() {
    let size = 0;
    for (const segment of this.segments) {
      size += segment.sizeInBits();
    }
    return size;
  }

  get messageSize() {
    let size = 0;
    for (const segment of this.segments) {
      size += segment.messageSizeInBits();
    }
    return size;
  }
}
