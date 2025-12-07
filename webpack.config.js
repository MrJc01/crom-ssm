const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

const commonConfig = {
  mode: 'development',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js',
    globalObject: 'this',
  },
  target: 'electron-renderer',
  module: {
    rules: [
      { test: /\.css$/, use: ['style-loader', 'css-loader', 'postcss-loader'] },
      { test: /\.ttf$/, type: 'asset/resource' }
    ],
  },
  devtool: 'source-map'
};

const mainAppConfig = {
  ...commonConfig,
  entry: {
    main: './src/renderer/index.js',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/renderer/index.html',
      filename: 'index.html',
      chunks: ['main'],
      meta: {
        'Content-Security-Policy': { 
          'http-equiv': 'Content-Security-Policy', 
          'content': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; worker-src 'self' blob:; img-src 'self' data:;"
        },
      },
    }),
    new MonacoWebpackPlugin({
      languages: ['javascript', 'typescript', 'html', 'css', 'json', 'markdown', 'shell', 'python', 'php', 'sql', 'yaml'],
    }),
  ],
};

const welcomeConfig = {
    ...commonConfig,
    entry: {
        welcome: './src/renderer/welcome.js'
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/renderer/welcome.html',
            filename: 'welcome.html',
            chunks: ['welcome']
        })
    ]
};

module.exports = [mainAppConfig, welcomeConfig];