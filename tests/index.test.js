const { SegmentedMessage } = require('../dist');

const UCS2data = `
Hi Michael!
Please be sure to be ready tomorrow morning 5am 🚀
See you tomorrow!
`;

const GSM7data = `
Hi Michael!
Please be sure to be ready tomorrow morning 5am!
See you tomorrow!
`;

test('GSM7 test', () => {
  const segmentedMessage = new SegmentedMessage(GSM7data);
  expect(segmentedMessage.encodingName).toBe('GSM-7');
  // Web UI: Number of characters
  expect(segmentedMessage.graphemes.length).toBe(80)
  // Web UI: Message Size
  expect(segmentedMessage.messageSize).toBe(560);
  // Web UI: Total size sent
  expect(segmentedMessage.totalSize).toBe(560);

  // Non Web UI test 
  expect(segmentedMessage.segments.length).toBe(1);
  expect(segmentedMessage.segments[0].length).toBe(80)
  for (var index = 0; index < 80; index++) {
      expect(segmentedMessage.segments[0][index].isGSM7).toBe(true)
  }
});

test('GSM7 test', () => {
    const segmentedMessage = new SegmentedMessage(UCS2data);
    expect(segmentedMessage.encodingName).toBe('UCS-2');
    // Web UI: Number of characters
    expect(segmentedMessage.graphemes.length).toBe(81)
    // Web UI: Message Size
    expect(segmentedMessage.messageSize).toBe(1312);
    // Web UI: Total size sent
    expect(segmentedMessage.totalSize).toBe(1408);
  
    // Non Web UI test 
    expect(segmentedMessage.segments.length).toBe(2);
    expect(segmentedMessage.segments[0].length).toBe(72)
    for (var index = 0; index < 6; index++) {
        expect(segmentedMessage.segments[0][index].isReservedChar).toBe(true)
        expect(segmentedMessage.segments[1][index].isReservedChar).toBe(true)
    }
    // Check emoji is not GSM 
    expect(segmentedMessage.segments[0][67].isGSM7).toBe(false)
  });