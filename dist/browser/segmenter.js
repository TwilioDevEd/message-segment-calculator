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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeRcs = exports.analyzeSms = void 0;
var SegmentedMessage_1 = require("../libs/SegmentedMessage");
var RcsSegmentedMessage_1 = require("../libs/RcsSegmentedMessage");
var getSmsCapacity = function (encodingName, segmentsCount) {
    if (encodingName === 'GSM-7') {
        return segmentsCount > 1 ? 153 : 160;
    }
    return segmentsCount > 1 ? 67 : 70;
};
/*
 * `\r` and `\n` are both single-code-unit characters in GSM-7 and UCS-2 (see UnicodeToGSM.ts),
 * so converting a lone LF to CRLF always adds exactly one code unit per line break - the resulting
 * segment count can be derived from the character total instead of re-segmenting the message.
 */
var segmentsCountForCharacters = function (characters, encodingName) {
    var singleSegmentCapacity = getSmsCapacity(encodingName, 1);
    if (characters <= singleSegmentCapacity) {
        return 1;
    }
    return Math.ceil(characters / getSmsCapacity(encodingName, 2));
};
var getCrlfWarning = function (message, segmentedMessage, encodingName) {
    if (segmentedMessage.lineBreakStyle !== 'LF') {
        return [];
    }
    var lineBreakCount = (message.match(/\n/g) || []).length;
    var crlfCharacters = segmentedMessage.numberOfCharacters + lineBreakCount;
    var crlfSegmentsCount = segmentsCountForCharacters(crlfCharacters, encodingName);
    if (crlfSegmentsCount <= segmentedMessage.segmentsCount) {
        return [];
    }
    return ["LF segment count: ".concat(segmentedMessage.segmentsCount, "; CRLF may use ").concat(crlfSegmentsCount, " and affect pricing.")];
};
var countSegmentUsed = function (segment) {
    return segment.reduce(function (total, item) {
        if (item.isReservedChar) {
            return total;
        }
        return total + (item.codeUnits ? item.codeUnits.length : 0);
    }, 0);
};
var getCharCodeUnits = function (raw) {
    var units = [];
    for (var i = 0; i < raw.length; i++) {
        units.push(raw.charCodeAt(i));
    }
    return units;
};
var extractCharDetails = function (segmentedMessage, encodingName) {
    var charDetails = [];
    segmentedMessage.segments.forEach(function (segment, segIdx) {
        var e_1, _a;
        try {
            for (var segment_1 = __values(segment), segment_1_1 = segment_1.next(); !segment_1_1.done; segment_1_1 = segment_1.next()) {
                var item = segment_1_1.value;
                if (item.isReservedChar)
                    continue;
                var codeUnits = encodingName === 'UCS-2' && item.isGSM7 ? getCharCodeUnits(item.raw) : item.codeUnits || [];
                charDetails.push({
                    raw: item.raw,
                    codeUnits: codeUnits,
                    isGSM7: item.isGSM7,
                    segmentIndex: segIdx,
                    messageEncoding: encodingName,
                });
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (segment_1_1 && !segment_1_1.done && (_a = segment_1.return)) _a.call(segment_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    });
    return charDetails;
};
var analyzeSms = function (message, encoding, smartEncoding) {
    var segmentedMessage = new SegmentedMessage_1.SegmentedMessage(message, encoding, smartEncoding);
    var encodingName = segmentedMessage.encodingName, segmentsCount = segmentedMessage.segmentsCount;
    var encodingKind = encodingName === 'GSM-7' ? 'gsm7' : 'unicode';
    var capacity = getSmsCapacity(encodingName, segmentsCount);
    var segments = segmentedMessage.segments.map(function (segment, index) { return ({
        index: index,
        capacity: capacity,
        used: countSegmentUsed(segment),
    }); });
    var lastSegment = segments[segments.length - 1];
    var remaining = lastSegment ? Math.max(0, capacity - lastSegment.used) : capacity;
    return {
        encoding: encodingKind,
        encodingLabel: encodingName === 'GSM-7' ? 'GSM-7' : 'Unicode (UCS-2)',
        segments: segments,
        segmentsCount: segmentsCount,
        characters: segmentedMessage.numberOfCharacters,
        remaining: remaining,
        messageSize: segmentedMessage.messageSize,
        totalSize: segmentedMessage.totalSize,
        unicodeScalars: segmentedMessage.numberOfUnicodeScalars,
        nonGsmCharacters: segmentedMessage.getNonGsmCharacters(),
        warnings: __spreadArray(__spreadArray([], __read(segmentedMessage.warnings), false), __read(getCrlfWarning(message, segmentedMessage, encodingName)), false),
        charDetails: extractCharDetails(segmentedMessage, encodingName),
    };
};
exports.analyzeSms = analyzeSms;
var analyzeRcs = function (message, region) {
    var rcsMessage = new RcsSegmentedMessage_1.RcsSegmentedMessage(message, region);
    var segments = rcsMessage.segments.map(function (segment) { return ({
        index: segment.index,
        capacity: segment.capacity,
        used: segment.used,
    }); });
    var lastSegment = segments[segments.length - 1];
    var remaining = lastSegment ? Math.max(0, lastSegment.capacity - lastSegment.used) : 160;
    return {
        encoding: 'rcs',
        encodingLabel: 'UTF-8',
        region: region,
        segments: segments,
        segmentsCount: rcsMessage.segmentsCount,
        characters: rcsMessage.numberOfBytes,
        unicodeLength: Array.from(message).length,
        remaining: remaining,
        messageSize: rcsMessage.messageSize,
        messageType: rcsMessage.messageType,
    };
};
exports.analyzeRcs = analyzeRcs;
//# sourceMappingURL=segmenter.js.map