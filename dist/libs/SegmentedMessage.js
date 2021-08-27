"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SegmentedMessage = void 0;
var grapheme_splitter_1 = __importDefault(require("grapheme-splitter"));
var Segment_1 = __importDefault(require("./Segment"));
var EncodedChar_1 = __importDefault(require("./EncodedChar"));
var UnicodeToGSM_1 = __importDefault(require("./UnicodeToGSM"));
var validEncodingValues = ['GSM-7', 'UCS-2', 'auto'];
/**
 * Class representing a segmented SMS
 */
var SegmentedMessage = /** @class */ (function () {
    /**
     *
     * Create a new segmented message from a string
     *
     * @param {string} message Body of the message
     * @param {boolean} [encoding] Optional: encoding. It can be 'GSM-7', 'UCS-2', 'auto'. Default value: 'auto'
     * @property {number} numberOfUnicodeScalars  Number of Unicode Scalars (i.e. unicode pairs) the message is made of
     *
     */
    function SegmentedMessage(message, encoding) {
        if (encoding === void 0) { encoding = 'auto'; }
        var splitter = new grapheme_splitter_1.default();
        if (!validEncodingValues.includes(encoding)) {
            throw new Error("Encoding " + encoding + " not supported. Valid values for encoding are " + validEncodingValues.join(', '));
        }
        /**
         * @property {string[]} graphemes Graphemes (array of strings) the message have been split into
         */
        this.graphemes = splitter.splitGraphemes(message);
        /**
         * @property {number} numberOfUnicodeScalars  Number of Unicode Scalars (i.e. unicode pairs) the message is made of
         * Some characters (e.g. extended emoji) can be made of more than one unicode pair
         */
        this.numberOfUnicodeScalars = __spreadArray([], __read(message)).length;
        /**
         * @property {number} numberOfCharacters Number of characters in the message. Each character count as 1, regardless of the encoding.
         */
        this.numberOfCharacters = this.graphemes.length;
        /**
         * @property {string} encoding Encoding set in the constructor for the message. Allowed values: 'GSM-7', 'UCS-2', 'auto'.
         * @private
         */
        this.encoding = encoding;
        if (this._hasAnyUCSCharacters(this.graphemes)) {
            if (encoding === 'GSM-7') {
                throw new Error('The string provided is incompatible with GSM-7 encoding');
            }
            /**
             * @property {string} encodingName Calculated encoding name. It can be: "GSM-7" or "UCS-2"
             */
            this.encodingName = 'UCS-2';
        }
        else {
            this.encodingName = 'GSM-7';
        }
        /**
         * @property {string[]} encodedChars Array of encoded characters
         */
        this.encodedChars = this._encodeChars(this.graphemes);
        /**
         * @property {object[]} segments Array of segment(s) the message have been segmented into
         */
        this.segments = this._buildSegments(this.encodedChars);
    }
    /**
     * Internal method to check if the message has any non-GSM7 characters
     *
     * @param {string[]} graphemes Message body
     * @returns {boolean} True if there are non-GSM-7 characters
     * @private
     */
    SegmentedMessage.prototype._hasAnyUCSCharacters = function (graphemes) {
        var e_1, _a;
        var result = false;
        try {
            for (var graphemes_1 = __values(graphemes), graphemes_1_1 = graphemes_1.next(); !graphemes_1_1.done; graphemes_1_1 = graphemes_1.next()) {
                var grapheme = graphemes_1_1.value;
                if (grapheme.length >= 2 || (grapheme.length === 1 && !UnicodeToGSM_1.default[grapheme.charCodeAt(0)])) {
                    result = true;
                    break;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (graphemes_1_1 && !graphemes_1_1.done && (_a = graphemes_1.return)) _a.call(graphemes_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return result;
    };
    /**
     * Internal method used to build message's segment(s)
     *
     * @param {object[]} encodedChars Array of EncodedChar
     * @returns {object[]} Array of Segment
     * @private
     */
    SegmentedMessage.prototype._buildSegments = function (encodedChars) {
        var e_2, _a;
        var segments = [];
        segments.push(new Segment_1.default());
        var currentSegment = segments[0];
        try {
            for (var encodedChars_1 = __values(encodedChars), encodedChars_1_1 = encodedChars_1.next(); !encodedChars_1_1.done; encodedChars_1_1 = encodedChars_1.next()) {
                var encodedChar = encodedChars_1_1.value;
                if (currentSegment.freeSizeInBits() < encodedChar.sizeInBits()) {
                    segments.push(new Segment_1.default(true));
                    currentSegment = segments[segments.length - 1];
                    var previousSegment = segments[segments.length - 2];
                    if (!previousSegment.hasUserDataHeader) {
                        var removedChars = previousSegment.addHeader();
                        // eslint-disable-next-line no-loop-func
                        removedChars.forEach(function (char) { return currentSegment.push(char); });
                    }
                }
                currentSegment.push(encodedChar);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (encodedChars_1_1 && !encodedChars_1_1.done && (_a = encodedChars_1.return)) _a.call(encodedChars_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return segments;
    };
    /**
     * Return the encoding of the message segment
     *
     * @returns {string} Encoding for the message segment(s)
     */
    SegmentedMessage.prototype.getEncodingName = function () {
        return this.encodingName;
    };
    /**
     * Internal method to create an array of EncodedChar from a string
     *
     * @param {string[]} graphemes Array of graphemes representing the message
     * @returns {object[]} Array of EncodedChar
     * @private
     */
    SegmentedMessage.prototype._encodeChars = function (graphemes) {
        var e_3, _a;
        var encodedChars = [];
        try {
            for (var graphemes_2 = __values(graphemes), graphemes_2_1 = graphemes_2.next(); !graphemes_2_1.done; graphemes_2_1 = graphemes_2.next()) {
                var grapheme = graphemes_2_1.value;
                encodedChars.push(new EncodedChar_1.default(grapheme, this.encodingName));
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (graphemes_2_1 && !graphemes_2_1.done && (_a = graphemes_2.return)) _a.call(graphemes_2);
            }
            finally { if (e_3) throw e_3.error; }
        }
        return encodedChars;
    };
    Object.defineProperty(SegmentedMessage.prototype, "totalSize", {
        /**
         * @returns {number} Total size of the message in bits (including User Data Header if present)
         */
        get: function () {
            var e_4, _a;
            var size = 0;
            try {
                for (var _b = __values(this.segments), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var segment = _c.value;
                    size += segment.sizeInBits();
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_4) throw e_4.error; }
            }
            return size;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SegmentedMessage.prototype, "messageSize", {
        /**
         * @returns {number} Total size of the message in bits (excluding User Data Header if present)
         */
        get: function () {
            var e_5, _a;
            var size = 0;
            try {
                for (var _b = __values(this.segments), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var segment = _c.value;
                    size += segment.messageSizeInBits();
                }
            }
            catch (e_5_1) { e_5 = { error: e_5_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_5) throw e_5.error; }
            }
            return size;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SegmentedMessage.prototype, "segmentsCount", {
        /**
         *
         * @returns {number} Number of segments
         */
        get: function () {
            return this.segments.length;
        },
        enumerable: false,
        configurable: true
    });
    /**
     *
     * @returns {string[]} Array of characters representing the non GSM-7 characters in the message body
     */
    SegmentedMessage.prototype.getNonGsmCharacters = function () {
        return this.encodedChars.filter(function (encodedChar) { return !encodedChar.isGSM7; }).map(function (encodedChar) { return encodedChar.raw; });
    };
    return SegmentedMessage;
}());
exports.SegmentedMessage = SegmentedMessage;
//# sourceMappingURL=SegmentedMessage.js.map