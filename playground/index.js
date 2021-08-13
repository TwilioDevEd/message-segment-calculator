const { SegmentedMessage } = require('../dist');
const chalk = require('chalk');

const encodingColors = {
  'GSM-7': chalk.green,
  'UCS-2': chalk.yellow,
  UDH: chalk.grey,
};

if (!process.argv[2]) {
  console.log(`
    Usage: 
    node index.js "<body of the message>"

    Example: 
    node index.js "👋 Hello World 🌍"
    `);
  return;
}

const message = process.argv[2];
const segmentedMessage = new SegmentedMessage(message);

function serializeSegment(segment) {
  let result = [];
  segment.forEach((char) => {
    if (char.codeUnits) {
      char.codeUnits.forEach((codeUnit) => {
        result.push({
          value: `0x${codeUnit.toString(16)}`,
          type: char.isGSM7 ? 'GSM-7' : 'UCS-2',
        });
      });
    } else {
      result.push({ value: 'UDH', type: 'UDH' });
    }
  });
  return result;
}

console.log(`
Encoding: ${chalk.magenta(segmentedMessage.encodingName)}
Number of Segment: ${chalk.magenta(segmentedMessage.segmentsCount)}
Message Size: ${chalk.magenta(segmentedMessage.messageSize)}
Total Size: ${chalk.magenta(segmentedMessage.totalSize)}
Number of Unicode Scalars: ${chalk.magenta(segmentedMessage.numberOfUnicodeScalars)}

${chalk.blue('Segments encoding')}`);

segmentedMessage.segments.forEach((segment, index) => {
  console.log(chalk.cyan(`\nSegment ${index + 1}\n`));
  let serializedSegment = serializeSegment(segment);
  let byteIndex = 0;
  while (byteIndex < serializedSegment.length) {
    let byteRow = `${byteIndex}\t`;
    for (let col = 0; col < 10; col++) {
      let byte = serializedSegment[byteIndex];
      if (byte) {
        byteRow += `${encodingColors[byte.type](byte.value)}\t`;
      }
      byteIndex += 1;
    }
    console.log(byteRow);
  }
});

console.log(`\n`);
