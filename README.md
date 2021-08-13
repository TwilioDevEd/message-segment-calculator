# SMS Segment Calculator

This repo contains a package for an SMS segments calculator. The package is released as nodeJS package as well as browser script. 
A browser demo for this package can be accessed [here](https://twiliodeved.github.io/message-segment-calculator/)

## Usage 

### nodeJS

Sample usage: 

```javascript
const { SegmentedMessage } = require('sms-segment-calculator');

const segmentedMessage = new SegmentedMessage('Hello World');

console.log(segmentedMessage.encodingName); // "GSM-7"
console.log(segmentedMessage.segmentsCount); // "2"
```

### Browser

You can add the library to your page using the CDN file: 

```html
<script src="https://cdn.jsdelivr.net/gh/TwilioDevEd/message-segment-calculator/docs/scripts/segmentsCalculator.js" integrity="sha256-wXuHVlXNhEWNzRKozzB87Qyi9/3p6LKskjDXFHIMInw=" crossorigin="anonymous"></script>
```

Alternatively you can add the library to your page using the file [`segmentsCalculator.js`](https://github.com/TwilioDevEd/message-segment-calculator/blob/main/docs/scripts/segmentsCalculator.js) provided in `docs/scripts/` and adding it to your page: 

```html
<script type="text/javascript" src="scripts/segmentsCalculator.js"></script>
```

And example of usage can be find in [`docs/index.html`](https://github.com/TwilioDevEd/message-segment-calculator/blob/main/docs/index.html)

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

## Try the library

If you want to test the library you can use the script provided in `playground/index.js`. Install the dependencies (`npm install`) and then run: 

```shell
$ node playground/index.js "👋 Hello World 🌍"
```

## Contributing

This code is open source and welcomes contributions. All contributions are subject to our [Code of Conduct](https://github.com/twilio-labs/.github/blob/master/CODE_OF_CONDUCT.md).

The source code for the library is all contained in the `src` folder. Before submitting a PR: 

* Run linter using `npm run lint` command and make sure there are no linter error
* Compile the code using `npm run build` command and make sure there are no errors
* Execute the test using `npm test` and make sure all tests pass
* Transpile the code using `npm run webpack` and test the web page in `docs/index.html`

## License

[MIT](http://www.opensource.org/licenses/mit-license.html)

## Disclaimer

No warranty expressed or implied. Software is as is.

[twilio]: https://www.twilio.com
