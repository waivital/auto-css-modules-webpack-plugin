const path = require('path')
const AutoCSSModulesWebpackPlugin = require('auto-css-modules-webpack-plugin')

function getCssLoader(cssModules, preprocessor = '') {
  const extraLoaderNum = preprocessor ? 1 : 0

  return [
    'style-loader',
    cssModules
      ? {
          loader: 'css-loader',
          options: {
            importLoaders: extraLoaderNum,
            modules: true,
          },
        }
      : {
          loader: 'css-loader',
          options: {
            importLoaders: extraLoaderNum,
            modules: false,
          },
        },
    preprocessor ? `${preprocessor}-loader` : '',
  ].filter(Boolean)
}

module.exports = {
  mode: 'development',
  devtool: false,
  output: {
    path: path.resolve('./dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.scss$/i,
        oneOf: [
          {
            resourceQuery: /modules/,
            use: getCssLoader(true, 'sass'),
          },
          {
            use: getCssLoader(false, 'sass'),
          },
        ],
      },
      {
        test: /\.css$/i,
        oneOf: [
          {
            resourceQuery: /modules/,
            use: getCssLoader(true),
          },
          {
            use: getCssLoader(false),
          },
        ],
      },
    ],
  },
  entry: path.join(__dirname, './main.js'),
  plugins: [new AutoCSSModulesWebpackPlugin()],
}
