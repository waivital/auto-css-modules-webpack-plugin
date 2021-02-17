# Auto CSS Modules Webpack Plugin

Automatically detect and mark CSS modules for webpack.

## Installation

For npm
```bash
npm install --save-dev auto-css-modules-webpack-plugin
```

For yarn
```bash
yarn add -D auto-css-modules-webpack-plugin
```

## Usage

config with `css-loader`

**webpack.config.js**

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        oneOf: [
          {
            resourceQuery: /modules/,
            loader: 'css-loader',
            options: {
              // Enable CSS Modules features and setup options for them.
              modules: {
                localIdentName: '[path][name]__[local]--[hash:base64:5]',
                // ... Other options
              }
            }
          },
          {
            loader: 'css-loader'
          }
        ],
      },
    ],
  },
  // Add this plugin
  plugins: [new AutoCSSModulesWebpackPlugin()]
};
```

The following statements will be marked as CSS Modules

```js
import styles from './index.css'
// Or
const styles = require('./index.css')
// Or
const styles = _anyFunctionWrap(require('./index.css'))
```

## Options

You can pass an options object to AutoCSSModulesWebpackPlugin. Allowed values are as follows:

|        Name         |     Type     |   Default   | Description                                        |
| :-----------------: | :----------: | :---------: | :------------------------------------------------- |
|   **`queryFlag`**   |  `{string}`  | `'modules'` | The resource query will add to the request string  |
| **`extraExtnames`** | `{string[]}` |    `[]`     | More extnames are needed to consider as style file |

Default extname list is `['.css', '.less', '.sass', '.scss', '.stylus', '.styl']`, cannot be overwrite currently.

## How it works

Because the usage scenario of CSS Modules always need `import` or `require` a CSS file then bind it to a variable, so we can analyze the ast of the file, when it match this pattern, add a query to the request string.

For example, `import styles from './index.css'` will be converted to `import styles from'./index.css?modules'`

And a [hook](https://webpack.js.org/api/parser/#program) `parser.hooks.program` inside webpack gives us the opportunity to modify the file's ast before it actually parse the dependencies.

Then we can use `resourceQuery` to pass different options to the loader, one for normal CSS and one for CSS Modules.

## Thanks

Inspired by [@umijs/babel-plugin-auto-css-modules](https://www.npmjs.com/package/@umijs/babel-plugin-auto-css-modules)


## License

[MIT](./LICENSE)
