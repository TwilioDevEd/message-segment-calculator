# Messaging Segment Calculator

This repo contains a package for an SMS segments calculator. The package is released as nodeJS package as well as browser script. 
A browser demo for this package can be accessed [here](https://twiliodeved.github.io/message-segment-calculator/)

## Usage 

### nodeJS

Sample usage: 

```javascript
const { SegmentedMessage } = require('sms-segment-calculator');

const segmentedMessage = new SegmentedMessage('Hello World');

console.log(segmentedMessage.encodingName); // "GSM-7"
console.log(segmentedMessage.segments.length); // "2"
```

### Browser

You can add the library to your page using: 

```html
    <script type="text/javascript" src="scripts/segmentsCalculator.js"></script>
```

## `SegmentedMessage` class

This is the main class exposed by the package

### `constructor(message, encoding)`
Arguments:
* `message`: Body of the SMS 
* `encoding`: Optional: encoding. It can be `GSM-7`, `UCS-2`, `auto`. Default value: `auto`

### `getEncodingName()`

Returns the name of the calculated encoding for the message: `GSM-7` or `UCS-2`

### `totalSize`

Total size of the message in bits (including User Data Header if present)

### `messageSize`

Total size of the message in bits (excluding User Data Header if present)

### `segmentsCount()`

Number of segment(s)

## Contributing

This template is open source and welcomes contributions. All contributions are subject to our [Code of Conduct](https://github.com/twilio-labs/.github/blob/master/CODE_OF_CONDUCT.md).

## License

[MIT](http://www.opensource.org/licenses/mit-license.html)

## Disclaimer

No warranty expressed or implied. Software is as is.

[twilio]: https://www.twilio.com