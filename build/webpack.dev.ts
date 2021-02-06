import webpack from 'webpack';
import WebpackMerge from 'webpack-merge';
const NodemonWebpackPlugin = require('nodemon-webpack-plugin');

import { default as baseConfig } from './webpack.common';

const configuration: webpack.Configuration = WebpackMerge(baseConfig, {
  mode: 'development',
  plugins: [new NodemonWebpackPlugin()]
});

export default configuration;
