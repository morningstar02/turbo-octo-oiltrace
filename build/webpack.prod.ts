import * as webpack from 'webpack';
import * as WebpackMerge from 'webpack-merge';

import { default as baseConfig } from './webpack.common';

const configuration: webpack.Configuration = WebpackMerge(baseConfig, {
  mode: 'production'
});

export default configuration;
