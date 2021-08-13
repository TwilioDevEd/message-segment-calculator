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
 * Represent a Twilio reserved octet
 * Twilio messages reserve 6 of this per segment
 */
var TwilioReservedChar = /** @class */ (function (_super) {
    __extends(TwilioReservedChar, _super);
    function TwilioReservedChar() {
        var _this = 
        // content and encoding are not relevant for headers
        _super.call(this, '', 'GSM-7') || this;
        _this.isReservedChar = true;
        return _this;
    }
    TwilioReservedChar.codeUnitSizeInBits = function () {
        return 8;
    };
    TwilioReservedChar.prototype.sizeInBits = function () {
        return 8;
    };
    return TwilioReservedChar;
}(EncodedChar_1.default));
exports.default = TwilioReservedChar;
//# sourceMappingURL=TwilioReservedChar.js.map