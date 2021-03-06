const path = require('path');
const webpack = require('webpack');
const StaticSiteGeneratorPlugin = require('static-site-generator-webpack-plugin');

const env = process.env.WEBPACK_BUILD || 'development';

const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const webpackDevConfig = require('./webpack.base.config')('development');
const webpackProdConfig = require('./webpack.base.config')('production');

const paths = [
  '/',
  '/components/',
  '/components/player/',
  '/components/shortcut/',
  '/components/big-play-button/',
  '/components/poster-image/',
  '/components/loading-spinner/',
  '/components/control-bar/',
  '/components/play-toggle/',
  '/components/forward-control/',
  '/components/replay-control/',
  '/components/volume-menu-button/',
  '/components/playback-rate-menu-button/',
  '/customize/',
  '/customize/enable-disable-components/',
  '/customize/customize-source/',
  '/customize/customize-component/',
  '/404.html',
];

const config = [{
  devtool: 'source-map',
  devServer: {
    contentBase: './build',
    historyApiFallback: true,
    host: '0.0.0.0',
    port: 9000,
    stats: {
      chunks: false,
    },
  },
  entry: {
    main: ['babel-polyfill', './docs/lib/app'],
  },
  node: {
    fs: 'empty',
  },
  output: {
    filename: 'bundle.js',
    path: './build',
    libraryTarget: 'umd',
  },
  plugins: [
    new CleanWebpackPlugin(['build']),
    new CopyWebpackPlugin([
      { from: './docs/static', to: 'assets' },
      { from: './dist', to: 'assets' },
    ]),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(env),
    }),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new StaticSiteGeneratorPlugin('main', paths, {}),
    new webpack.NoErrorsPlugin(),
    new ExtractTextPlugin('/assets/style.css'),
  ],
  module: {
    loaders: [
      {
        test: /\.json$/,
        loaders: [
          'json-loader?cacheDirectory',
        ],
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,

        loader: 'babel-loader',
        options: {
          cacheDirectory: true,
          presets: ['es2015','stage-0', 'react'],
        },
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract('style-loader', 'css-loader'),
      },
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract('style-loader', 'css-loader!sass-loader'),
      },
      {
        test: /\.woff(2)?(\?[a-z0-9=&.]+)?$/,
        loader: 'url-loader?limit=10000&minetype=application/font-woff',
      },
      { test: /\.(ttf|eot|svg)(\?[a-z0-9=&.]+)?$/,
        loader: 'url-loader?limit=30000&name=[name]-[hash].[ext]',
      },
    ],
  },
  resolve: {
    extensions: ['', '.js', '.json'],
    alias: {
      'bootstrap-scss': path.join(__dirname, 'node_modules/bootstrap/scss/bootstrap.scss'),
      'video-react-scss': path.resolve('./styles/scss/video-react.scss'),
      'video-react': path.resolve('./src'),
    },
  },
}];

if (env === 'development') {
  config.push(webpackDevConfig);
  config.push(webpackProdConfig);
} else {
  config[0].plugins.push(new webpack.optimize.UglifyJsPlugin(
    {
      minimize: true,
      sourceMap: true,
      compress: {
        warnings: false,
      },
      mangle: true,
    },
  ));
}

module.exports = config;
