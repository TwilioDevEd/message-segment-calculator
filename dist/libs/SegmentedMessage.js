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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
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
var SmartEncodingMap_1 = __importDefault(require("./SmartEncodingMap"));
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
     * @param {boolean} smartEncoding Optional: whether or not Twilio's [Smart Encoding](https://www.twilio.com/docs/messaging/services#smart-encoding) is emulated. Default value: false
     * @property {number} numberOfUnicodeScalars  Number of Unicode Scalars (i.e. unicode pairs) the message is made of
     *
     */
    function SegmentedMessage(message, encoding, smartEncoding) {
        if (encoding === void 0) { encoding = 'auto'; }
        if (smartEncoding === void 0) { smartEncoding = false; }
        var splitter = new grapheme_splitter_1.default();
        if (!validEncodingValues.includes(encoding)) {
            throw new Error("Encoding ".concat(encoding, " not supported. Valid values for encoding are ").concat(validEncodingValues.join(', ')));
        }
        if (smartEncoding) {
            message = __spreadArray([], __read(message), false).map(function (char) { return (SmartEncodingMap_1.default[char] === undefined ? char : SmartEncodingMap_1.default[char]); })
                .join('');
        }
        /**
         * @property {string[]} graphemes Graphemes (array of strings) the message have been split into
         */
        this.graphemes = splitter.splitGraphemes(message).reduce(function (accumulator, grapheme) {
            var result = grapheme === '\r\n' ? grapheme.split('') : [grapheme];
            return accumulator.concat(result);
        }, []);
        /**
         * @property {number} numberOfUnicodeScalars  Number of Unicode Scalars (i.e. unicode pairs) the message is made of
         * Some characters (e.g. extended emoji) can be made of more than one unicode pair
         */
        this.numberOfUnicodeScalars = __spreadArray([], __read(message), false).length;
        /**
         * @property {string} encoding Encoding set in the constructor for the message. Allowed values: 'GSM-7', 'UCS-2', 'auto'.
         * @private
         */
        this.encoding = encoding;
        if (this.encoding === 'auto') {
            /**
             * @property {string} encodingName Calculated encoding name. It can be: "GSM-7" or "UCS-2"
             */
            this.encodingName = this._hasAnyUCSCharacters(this.graphemes) ? 'UCS-2' : 'GSM-7';
        }
        else {
            if (encoding === 'GSM-7' && this._hasAnyUCSCharacters(this.graphemes)) {
                throw new Error('The string provided is incompatible with GSM-7 encoding');
            }
            this.encodingName = this.encoding;
        }
        /**
         * @property {string[]} encodedChars Array of encoded characters composing the message
         */
        this.encodedChars = this._encodeChars(this.graphemes);
        /**
         * @property {number} numberOfCharacters Number of characters in the message. Each character count as 1 except for
         * the characters in the GSM extension character set.
         */
        this.numberOfCharacters =
            this.encodingName === 'UCS-2' ? this.graphemes.length : this._countCodeUnits(this.encodedChars);
        /**
         * @property {object[]} segments Array of segment(s) the message have been segmented into
         */
        this.segments = this._buildSegments(this.encodedChars);
        /**
         * @property {LineBreakStyle} lineBreakStyle message line break style
         */
        this.lineBreakStyle = this._detectLineBreakStyle(message);
        /**
         * @property {string[]} warnings message line break style
         */
        this.warnings = this._checkForWarnings();
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
    /**
     * Internal method to count the total number of code units of the message
     *
     * @param {EncodedChar[]} encodedChars Encoded message body
     * @returns {number} The total number of code units
     * @private
     */
    SegmentedMessage.prototype._countCodeUnits = function (encodedChars) {
        return encodedChars.reduce(function (acumulator, nextEncodedChar) { return acumulator + nextEncodedChar.codeUnits.length; }, 0);
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
    /**
     * Internal method to check the line break styled used in the passed message
     *
     * @param {string} message Message body
     * @returns {LineBreakStyle} The libre break style name LF or CRLF
     * @private
     */
    SegmentedMessage.prototype._detectLineBreakStyle = function (message) {
        var hasWindowsStyle = message.includes('\r\n');
        var HasUnixStyle = message.includes('\n');
        var mixedStyle = hasWindowsStyle && HasUnixStyle;
        var noBreakLine = !hasWindowsStyle && !HasUnixStyle;
        if (noBreakLine) {
            return undefined;
        }
        if (mixedStyle) {
            return 'LF+CRLF';
        }
        return HasUnixStyle ? 'LF' : 'CRLF';
    };
    /**
     * Internal method to check the line break styled used in the passed message
     *
     * @returns {string[]} The libre break style name LF or CRLF
     * @private
     */
    SegmentedMessage.prototype._checkForWarnings = function () {
        var warnings = [];
        if (this.lineBreakStyle) {
            warnings.push('The message has line breaks, the web page utility only supports LF style. If you insert a CRLF it will be converted to LF.');
        }
        return warnings;
    };
    return SegmentedMessage;
}());
exports.SegmentedMessage = SegmentedMessage;
//# sourceMappingURL=SegmentedMessage.js.map