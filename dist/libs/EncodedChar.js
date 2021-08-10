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
    function EncodedChar(char) {
        this.raw = char;
        this.isGSM7 = Boolean(char && UnicodeToGSM_1.default[char.charCodeAt(0)]);
    }
    return EncodedChar;
}());
exports.default = EncodedChar;
//# sourceMappingURL=EncodedChar.js.map