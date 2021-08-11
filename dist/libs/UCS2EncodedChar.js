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
/*
 * Represent a UCS-2 encoded character
 * UCS-2 is of fixed length and requires 2 code units per character
 * a UCS-2 code unit is an octet (8bits)
 */
var UCS2EncodedChar = /** @class */ (function (_super) {
    __extends(UCS2EncodedChar, _super);
    function UCS2EncodedChar(char, graphemeSize) {
        if (graphemeSize === void 0) { graphemeSize = 1; }
        var _this = _super.call(this, char, 'UCS-2') || this;
        _this.graphemeSize = graphemeSize === undefined ? 1 : graphemeSize;
        if (char.length === 2) {
            _this.codeUnits = [char.charCodeAt(0), char.charCodeAt(1)];
        }
        else {
            _this.codeUnits = [char.charCodeAt(0)];
        }
        return _this;
    }
    UCS2EncodedChar.codeUnitSizeInBits = function () {
        return 16; // UCS-2 code units are 8bits long
    };
    UCS2EncodedChar.prototype.sizeInBits = function () {
        return 16 * this.raw.length;
    };
    return UCS2EncodedChar;
}(EncodedChar_1.default));
exports.default = UCS2EncodedChar;
//# sourceMappingURL=UCS2EncodedChar.js.map