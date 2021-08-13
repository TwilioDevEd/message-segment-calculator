"use strict";
/*
 * Represent a User Data Header https://en.wikipedia.org/wiki/User_Data_Header
 * Twilio messages reserve 6 of this per segment in a concatenated message
 */
Object.defineProperty(exports, "__esModule", { value: true });
var UserDataHeader = /** @class */ (function () {
    function UserDataHeader() {
        this.isReservedChar = true;
        this.isUserDataHeader = true;
    }
    UserDataHeader.codeUnitSizeInBits = function () {
        return 8;
    };
    UserDataHeader.prototype.sizeInBits = function () {
        return 8;
    };
    return UserDataHeader;
}());
exports.default = UserDataHeader;
//# sourceMappingURL=UserDataHeader.js.map