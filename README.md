# Messaging Segment Calculator (SMS + RCS)

This repo contains a package for SMS and RCS segment calculations. The package is released as a nodeJS package as well as a browser script.
Want to see it in action? [Try the live Segment Calculator](https://twil.io/iY0Jwws) to see how any message is encoded and how many segments it takes.

## Usage 

### nodeJS

The package can be installed using: 

```shell
npm install --save sms-segments-calculator
```

Sample usage:

```javascript
const { SegmentedMessage, RcsSegmentedMessage } = require('sms-segments-calculator');

const segmentedMessage = new SegmentedMessage('Hello World');

console.log(segmentedMessage.encodingName); // "GSM-7"
console.log(segmentedMessage.segmentsCount); // "1"

const rcsMessage = new RcsSegmentedMessage('Hello RCS', 'us');
console.log(rcsMessage.messageType); // "Rich"
console.log(rcsMessage.segmentsCount); // "1"
```

### Browser

You can add the library to your page using the CDN file:

```html
<script src="https://cdn.jsdelivr.net/gh/TwilioDevEd/message-segment-calculator/docs/scripts/segmentsCalculator.js" integrity="sha256-e2498331ca98c0d43952423be7ff75944f7f29d201da4ee466bd06e59e8054cb" crossorigin="anonymous"></script>
```

Alternatively you can add the library to your page using the file [`segmentsCalculator.js`](https://github.com/TwilioDevEd/message-segment-calculator/blob/main/docs/scripts/segmentsCalculator.js) provided in `docs/scripts/` and adding it to your page:

```html
<script type="text/javascript" src="scripts/segmentsCalculator.js"></script>
```

Once loaded, the browser bundle exposes `SegmentedMessage` and `RcsSegmentedMessage` as globals.

An example of usage can be find in [`docs/index.html`](https://github.com/TwilioDevEd/message-segment-calculator/blob/main/docs/index.html)

## Documentation 
### `SegmentedMessage` class

This is the main class exposed by the package

#### [`constructor(message, encoding)`](https://github.com/TwilioDevEd/message-segment-calculator/blob/403313a44ed406b3669cf3c57f32ca98fd92b1e1/src/libs/SegmentedMessage.ts#L37)
Arguments:
* `message`: Body of the SMS 
* `encoding`: Optional: encoding. It can be `GSM-7`, `UCS-2`, `auto`. Default value: `auto`

##### `encodingName` 

Returns the name of the calculated encoding for the message: `GSM-7` or `UCS-2`

#### [`totalSize`](https://github.com/TwilioDevEd/message-segment-calculator/blob/403313a44ed406b3669cf3c57f32ca98fd92b1e1/src/libs/SegmentedMessage.ts#L161)

Total size of the message in bits (including User Data Header if present)

#### [`messageSize`](https://github.com/TwilioDevEd/message-segment-calculator/blob/403313a44ed406b3669cf3c57f32ca98fd92b1e1/src/libs/SegmentedMessage.ts#L172)

Total size of the message in bits (excluding User Data Header if present)

#### [`segmentsCount`](https://github.com/TwilioDevEd/message-segment-calculator/blob/403313a44ed406b3669cf3c57f32ca98fd92b1e1/src/libs/SegmentedMessage.ts#L184)

Number of segment(s)

### [`getNonGsmCharacters()`]

Return an array with the non GSM-7 characters in the body. It can be used to replace character and reduce the number of segments 

### `RcsSegmentedMessage` class

RCS always uses UTF-8. For US destinations, messages are billed per 160 UTF-8 byte “Rich” segment. For international destinations, there is no segmentation: `<=160` bytes is billed as `Basic`, and `>160` bytes is billed as `Single`.

#### `constructor(message, region)`
Arguments:
* `message`: Body of the RCS message
* `region`: `us` or `international` (default: `us`)

##### `encodingName`

Always returns `"UTF-8"`.

##### `numberOfBytes`

Number of UTF-8 bytes in the message body.

##### `messageSize`

Total size of the message body in bits.

##### `segmentsCount`

Number of RCS segment(s) the message is split into for billing.

##### `segments`

An array with one entry per segment. Each entry contains `index`, `capacity`, and `used` (bytes).

##### `messageType`

Returns `Rich`, `Basic`, or `Single` based on the region and UTF-8 length.

##### `region`

The region used for calculation: `"us"` or `"international"`.

## Try the library

If you want to test the library you can use the script provided in `playground/index.js`. Install the dependencies (`npm install`) and then run: 

```shell
node playground/index.js "👋 Hello World 🌍"
```

## Contributing

This code is open source and welcomes contributions. All contributions are subject to our [Code of Conduct](https://github.com/twilio-labs/.github/blob/master/CODE_OF_CONDUCT.md).

The source code for the library is all contained in the `src` folder. Before submitting a PR: 

* Run linter using `npm run lint` command and make sure there are no linter error
* Compile the code using `npm run build` command and make sure there are no errors
* Execute the test using `npm test` and make sure all tests pass
* Transpile the code using `npm run webpack` and test the web page in `docs/index.html`

## Accessibility

The docs UI follows Paste-aligned accessibility guidelines:
* All color meaning includes a text label (encoding, fill state)
* Stats updates use `aria-live="polite"` for screen reader announcements
* Inputs include visible focus styles and associated labels
* Segment bars use `role=\"meter\"` with value attributes

## Design Inspiration

We used the Kimoby SMS Segment Counter as visual inspiration: https://www.kimoby.com/calculators/sms-segment-counter

## License

[MIT](http://www.opensource.org/licenses/mit-license.html)

## Disclaimer

No warranty expressed or implied. Software is as is.

[twilio]: https://www.twilio.com
