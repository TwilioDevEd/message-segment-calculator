import { SegmentedMessage } from '../libs/SegmentedMessage';
import { RcsSegmentedMessage, RcsRegion } from '../libs/RcsSegmentedMessage';
import type { SegmentData, SmsAnalysis, SmsEncodingSetting, RcsAnalysis, CharDetail } from './types';

/*
 * Segment extends Array and contains EncodedChar | UserDataHeader elements.
 * This type mirrors the subset of properties we access for counting.
 */
type SegmentElement = {
  isReservedChar?: boolean;
  codeUnits?: number[];
};

const getSmsCapacity = (encodingName: 'GSM-7' | 'UCS-2', segmentsCount: number): number => {
  if (encodingName === 'GSM-7') {
    return segmentsCount > 1 ? 153 : 160;
  }
  return segmentsCount > 1 ? 67 : 70;
};

const countSegmentUsed = (segment: SegmentElement[]): number => {
  return segment.reduce((total, item) => {
    if (item.isReservedChar) {
      return total;
    }
    return total + (item.codeUnits ? item.codeUnits.length : 0);
  }, 0);
};

const getCharCodeUnits = (raw: string): number[] => {
  const units: number[] = [];
  for (let i = 0; i < raw.length; i++) {
    units.push(raw.charCodeAt(i));
  }
  return units;
};

const extractCharDetails = (segmentedMessage: SegmentedMessage, encodingName: 'GSM-7' | 'UCS-2'): CharDetail[] => {
  const charDetails: CharDetail[] = [];
  segmentedMessage.segments.forEach((segment, segIdx) => {
    for (const item of segment) {
      if (item.isReservedChar) continue;
      const codeUnits = encodingName === 'UCS-2' && item.isGSM7 ? getCharCodeUnits(item.raw) : item.codeUnits || [];
      charDetails.push({
        raw: item.raw,
        codeUnits,
        isGSM7: item.isGSM7,
        segmentIndex: segIdx,
        messageEncoding: encodingName,
      });
    }
  });
  return charDetails;
};

export const analyzeSms = (message: string, encoding: SmsEncodingSetting, smartEncoding: boolean): SmsAnalysis => {
  const segmentedMessage = new SegmentedMessage(message, encoding, smartEncoding);
  const { encodingName, segmentsCount } = segmentedMessage;
  const encodingKind = encodingName === 'GSM-7' ? 'gsm7' : 'unicode';
  const capacity = getSmsCapacity(encodingName, segmentsCount);
  const segments: SegmentData[] = segmentedMessage.segments.map((segment, index) => ({
    index,
    capacity,
    used: countSegmentUsed(segment as SegmentElement[]),
  }));
  const lastSegment = segments[segments.length - 1];
  const remaining = lastSegment ? Math.max(0, capacity - lastSegment.used) : capacity;

  return {
    encoding: encodingKind,
    encodingLabel: encodingName === 'GSM-7' ? 'GSM-7' : 'Unicode (UCS-2)',
    segments,
    segmentsCount,
    characters: segmentedMessage.numberOfCharacters,
    remaining,
    messageSize: segmentedMessage.messageSize,
    totalSize: segmentedMessage.totalSize,
    unicodeScalars: segmentedMessage.numberOfUnicodeScalars,
    nonGsmCharacters: segmentedMessage.getNonGsmCharacters(),
    warnings: segmentedMessage.warnings,
    charDetails: extractCharDetails(segmentedMessage, encodingName),
  };
};

export const analyzeRcs = (message: string, region: RcsRegion): RcsAnalysis => {
  const rcsMessage = new RcsSegmentedMessage(message, region);
  const segments: SegmentData[] = rcsMessage.segments.map((segment) => ({
    index: segment.index,
    capacity: segment.capacity,
    used: segment.used,
  }));
  const lastSegment = segments[segments.length - 1];
  const remaining = lastSegment ? Math.max(0, lastSegment.capacity - lastSegment.used) : 160;

  return {
    encoding: 'rcs',
    encodingLabel: 'UTF-8',
    region,
    segments,
    segmentsCount: rcsMessage.segmentsCount,
    characters: rcsMessage.numberOfBytes,
    unicodeLength: Array.from(message).length,
    remaining,
    messageSize: rcsMessage.messageSize,
    messageType: rcsMessage.messageType,
  };
};
