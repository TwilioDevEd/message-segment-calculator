import EncodedChar from './EncodedChar';
/**
 * Segment Class
 * A modified array representing one segment and add some helper functions
 */
declare class Segment extends Array {
    hasTwilioReservedBits: boolean;
    hasUserDataHeader: boolean;
    constructor(withUserDataHeader?: boolean);
    sizeInBits(): number;
    messageSizeInBits(): number;
    freeSizeInBits(): number;
    addHeader(): EncodedChar[];
}
export default Segment;
