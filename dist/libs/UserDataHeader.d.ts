declare class UserDataHeader {
    isReservedChar: boolean;
    isUserDataHeader: boolean;
    constructor();
    static codeUnitSizeInBits(): number;
    sizeInBits(): number;
}
export default UserDataHeader;
