const path = require('path');
import webpack from 'webpack';
const helpers = require('./helpers');

const configuration: webpack.Configuration = {
  entry: {
    api: './src/server.ts'
  },
  output: {
    filename: 'api.js',
    path: helpers.resolvePath('dist', __dirname),
    publicPath: '/',
    libraryTarget: 'commonjs'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  externals: [/^(?!\.|\/).+/i],
  module: {
    rules: [
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
      {
        test: /\.ts$/,
        loaders: [
          {
            loader: 'awesome-typescript-loader',
            options: {
              configFileName: helpers.resolvePath(['tsconfig.json'], __dirname)
            }
          }
        ]
      }
    ]
  },
  devtool: 'source-map'
};

export default configuration;
