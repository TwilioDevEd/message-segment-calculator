"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var UnicodeToGSM_1 = __importDefault(require("./UnicodeToGSM"));
/**
 * Encoded Character Classes
 * Utility classes to represent a character in a given encoding.
 */
var EncodedChar = /** @class */ (function () {
    function EncodedChar(char, encoding) {
        this.raw = char;
        this.encoding = encoding;
        this.isGSM7 = Boolean(char && UnicodeToGSM_1.default[char.charCodeAt(0)]);
        if (this.isGSM7) {
            this.codeUnits = UnicodeToGSM_1.default[char.charCodeAt(0)];
        }
        else {
            this.codeUnits = [];
            for (var i = 0; i < char.length; i++) {
                this.codeUnits.push(char.charCodeAt(i));
            }
        }
    }
    EncodedChar.prototype.codeUnitSizeInBits = function () {
        return this.encoding === 'GSM-7' ? 7 : 8;
    };
    EncodedChar.prototype.sizeInBits = function () {
        if (this.encoding === 'UCS-2' && this.isGSM7) {
            // GSM characters are always using 16 bits in UCS-2 encoding
            return 16;
        }
        var bitsPerUnits = this.encoding === 'GSM-7' ? 7 : 16;
        return bitsPerUnits * this.codeUnits.length;
    };
    return EncodedChar;
}());
exports.default = EncodedChar;
//# sourceMappingURL=EncodedChar.js.map