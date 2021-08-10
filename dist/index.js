"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SegmentedMessage = void 0;
var grapheme_splitter_1 = __importDefault(require("grapheme-splitter"));
var UCS2EncodedChar_1 = __importDefault(require("./libs/UCS2EncodedChar"));
var GSM7EncodedChar_1 = __importDefault(require("./libs/GSM7EncodedChar"));
var Segment_1 = __importDefault(require("./libs/Segment"));
var validEncodingValues = ['GSM-7', 'UCS-2', 'auto'];
/*
 * interface smsSegmentsInfo {
 *   messageBodyText: string;
 *   encoding: SmsEncoding;
 *   segments: number;
 *   encodedBodyText: any;
 * }
 */
/**
 *
 * Parse a message and build the segments based on the chosen encoding.
 *
 */
// eslint-disable-next-line import/no-unused-modules
var SegmentedMessage = /** @class */ (function () {
    function SegmentedMessage(message, encoding) {
        if (encoding === void 0) { encoding = 'auto'; }
        var splitter = new grapheme_splitter_1.default();
        if (!validEncodingValues.includes(encoding)) {
            throw new Error("Encoding " + encoding + " not supported. Valid values for encoding are " + validEncodingValues.join(', '));
        }
        this.graphemes = splitter.splitGraphemes(message);
        this.encoding = encoding;
        if (this.hasAnyUCSCharacters(this.graphemes)) {
            if (encoding === 'GSM-7') {
                throw new Error('The string provided is incompatible with GSM-7 encoding');
            }
            this.CharClass = UCS2EncodedChar_1.default;
            this.encodingName = 'UCS-2';
        }
        else {
            this.CharClass = GSM7EncodedChar_1.default;
            this.encodingName = 'GSM-7';
        }
        var encodedChars = this.encodeChars(this.graphemes);
        this.segments = this.buildSegments(encodedChars);
    }
    SegmentedMessage.prototype.hasAnyUCSCharacters = function (graphemes) {
        var e_1, _a;
        var result = false;
        try {
            for (var graphemes_1 = __values(graphemes), graphemes_1_1 = graphemes_1.next(); !graphemes_1_1.done; graphemes_1_1 = graphemes_1.next()) {
                var grapheme = graphemes_1_1.value;
                if (grapheme.length >= 2) {
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
    SegmentedMessage.prototype.buildSegments = function (encodedChars, useTwilioReservedBits) {
        var e_2, _a;
        if (useTwilioReservedBits === void 0) { useTwilioReservedBits = false; }
        var segments = [];
        var hasTwilioReservedBits = useTwilioReservedBits === true;
        var currentSegment = null;
        try {
            for (var encodedChars_1 = __values(encodedChars), encodedChars_1_1 = encodedChars_1.next(); !encodedChars_1_1.done; encodedChars_1_1 = encodedChars_1.next()) {
                var encodedChar = encodedChars_1_1.value;
                if (currentSegment === null || currentSegment.freeSizeInBits() < encodedChar.sizeInBits()) {
                    if (currentSegment && hasTwilioReservedBits === false) {
                        return this.buildSegments(encodedChars, true);
                    }
                    currentSegment = new Segment_1.default(hasTwilioReservedBits);
                    segments.push(currentSegment);
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
    SegmentedMessage.prototype.getEncodingName = function () {
        return this.encodingName;
    };
    SegmentedMessage.prototype.encodeChars = function (graphemes) {
        var e_3, _a;
        var encodedChars = [];
        try {
            for (var graphemes_2 = __values(graphemes), graphemes_2_1 = graphemes_2.next(); !graphemes_2_1.done; graphemes_2_1 = graphemes_2.next()) {
                var grapheme = graphemes_2_1.value;
                if (grapheme.length <= 2) {
                    encodedChars.push(new this.CharClass(grapheme));
                }
                else {
                    var parts = __spreadArray([], __read(grapheme));
                    for (var i = 0; i < parts.length; i++) {
                        encodedChars.push(new this.CharClass(parts[i], i === 0 ? parts.length : 0));
                    }
                }
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
    return SegmentedMessage;
}());
exports.SegmentedMessage = SegmentedMessage;
// eslint-disable-next-line import/no-unused-modules
// export default SegmentedMessage;
//# sourceMappingURL=index.js.map