const path = require('path');

module.exports = {
  entry: './src/server.js',
  target: 'node',
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
    fallback: {
      "buffer": require.resolve('buffer'),
      "http": require.resolve("stream-http"),
      "url": require.resolve("url/"),
      "querystring": require.resolve("querystring-es3"),
    },
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
};