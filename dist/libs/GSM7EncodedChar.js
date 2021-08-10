"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var EncodedChar_1 = __importDefault(require("./EncodedChar"));
var UnicodeToGSM_1 = __importDefault(require("./UnicodeToGSM"));
/*
 * Represent a GSM-7 encoded character
 * GSM-7 is of variable length and requires 1 or 2 code units per character
 * a GSM-7 code unit is a septet (7bits)
 */
var GSM7EncodedChar = /** @class */ (function (_super) {
    __extends(GSM7EncodedChar, _super);
    function GSM7EncodedChar(char) {
        var _this = _super.call(this, char) || this;
        _this.graphemeSize = 1;
        if (char.length === 1) {
            _this.codeUnits = UnicodeToGSM_1.default[char.charCodeAt(0)];
        }
        return _this;
    }
    GSM7EncodedChar.codeUnitSizeInBits = function () {
        return 7; // GSM-7 code units are 7bits long
    };
    GSM7EncodedChar.prototype.sizeInBits = function () {
        if (this.codeUnits) {
            return this.codeUnits.length * 7; // GSM-7 can be composed of 1 or 2 code units
        }
        return 0; // Some characters do not exist in GSM-7 thus making their length 0
    };
    return GSM7EncodedChar;
}(EncodedChar_1.default));
exports.default = GSM7EncodedChar;
//# sourceMappingURL=GSM7EncodedChar.js.map