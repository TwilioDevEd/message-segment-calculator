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
var UserDataHeader_1 = __importDefault(require("./UserDataHeader"));
/**
 * Segment Class
 * A modified array representing one segment and add some helper functions
 */
var Segment = /** @class */ (function (_super) {
    __extends(Segment, _super);
    function Segment(withUserDataHeader) {
        if (withUserDataHeader === void 0) { withUserDataHeader = false; }
        var _this = _super.call(this) || this;
        // TODO: Refactor this. Bad practice to extend basic types
        Object.setPrototypeOf(_this, Object.create(Segment.prototype));
        _this.hasTwilioReservedBits = withUserDataHeader;
        _this.hasUserDataHeader = withUserDataHeader;
        if (withUserDataHeader) {
            for (var i = 0; i < 6; i++) {
                _this.push(new UserDataHeader_1.default());
            }
        }
        return _this;
    }
    // Size in bits *including* User Data Header (if present)
    Segment.prototype.sizeInBits = function () {
        return this.reduce(function (accumulator, encodedChar) { return accumulator + encodedChar.sizeInBits(); }, 0);
    };
    // Size in bits *excluding* User Data Header (if present)
    Segment.prototype.messageSizeInBits = function () {
        return this.reduce(function (accumulator, encodedChar) {
            return accumulator + (encodedChar instanceof UserDataHeader_1.default ? 0 : encodedChar.sizeInBits());
        }, 0);
    };
    Segment.prototype.freeSizeInBits = function () {
        var maxBitsInSegment = 1120; // max size of a SMS is 140 octets -> 140 * 8bits = 1120 bits
        return maxBitsInSegment - this.sizeInBits();
    };
    Segment.prototype.addHeader = function () {
        if (this.hasUserDataHeader) {
            return [];
        }
        var leftOverChar = [];
        this.hasTwilioReservedBits = true;
        this.hasUserDataHeader = false;
        for (var i = 0; i < 6; i++) {
            this.unshift(new UserDataHeader_1.default());
        }
        // Remove characters
        while (this.freeSizeInBits() < 0) {
            leftOverChar.unshift(this.pop());
        }
        return leftOverChar;
    };
    return Segment;
}(Array));
exports.default = Segment;
//# sourceMappingURL=Segment.js.map