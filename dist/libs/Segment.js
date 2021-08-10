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
var TwilioReservedChar_1 = __importDefault(require("./TwilioReservedChar"));
/**
 * Segment Class
 * A modified array representing one segment and add some helper functions
 */
var Segment = /** @class */ (function (_super) {
    __extends(Segment, _super);
    function Segment(hasTwilioReservedBits) {
        var _this = _super.call(this) || this;
        _this.hasTwilioReservedBits = hasTwilioReservedBits;
        if (_this.hasTwilioReservedBits) {
            for (var i = 0; i < 6; i++) {
                _this.push(new TwilioReservedChar_1.default(''));
            }
        }
        // TODO: Refactor this. Bad practice to extends basic types
        Object.setPrototypeOf(_this, Object.create(Segment.prototype));
        return _this;
    }
    Segment.prototype.sizeInBits = function () {
        return this.reduce(function (accumulator, encodedChar) { return accumulator + encodedChar.sizeInBits(); }, 0);
    };
    Segment.prototype.messageSizeInBits = function () {
        return this.reduce(function (accumulator, encodedChar) {
            return accumulator + (encodedChar instanceof TwilioReservedChar_1.default ? 0 : encodedChar.sizeInBits());
        }, 0);
    };
    Segment.prototype.freeSizeInBits = function () {
        var maxBitsInSegment = 1120; // max size of a SMS is 140 octets -> 140 * 8bits = 1120 bits
        return maxBitsInSegment - this.sizeInBits();
    };
    return Segment;
}(Array));
exports.default = Segment;
//# sourceMappingURL=Segment.js.map