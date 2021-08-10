const path = require('path');

module.exports = {
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  mode: 'production',
  output: {
    filename: 'segmentsCalculator.js',
    path: path.resolve(__dirname, 'docs/scripts/'),
    libraryTarget: "var",
    libraryExport: "SegmentedMessage",
    library: "SegmentedMessage"
  },
};
