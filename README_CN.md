# Auto CSS Modules Webpack Plugin

在 webpack 中自动检测并标记 CSS Modules.

- [English](README.md)

## 安装

For npm
```bash
npm install --save-dev auto-css-modules-webpack-plugin
```

For yarn
```bash
yarn add -D auto-css-modules-webpack-plugin
```

## 使用方式

和 `css-loader` 一起使用

**webpack.config.js**

```javascript
const AutoCSSModulesWebpackPlugin = require('auto-css-modules-webpack-plugin')

module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        oneOf: [
          {
            // enable cssModules for specific resourceQuery
            resourceQuery: /modules/,
            use: [
              'style-loader',
              {
                loader: 'css-loader',
                options: {
                  importLoaders: 1,
                  // Enable CSS Modules features and setup options for them.
                  modules: {
                    localIdentName: '[path][name]__[local]--[hash:base64:5]',
                    // ... Other options
                  }
                }
              }
            ]
          },
          {
            use: [
              'style-loader',
              {
                loader: 'css-loader',
                options: {
                  importLoaders: 1,
                }
              }
            ]
          },
        ],
      },
    ],
  },
  // Add this plugin
  plugins: [new AutoCSSModulesWebpackPlugin()]
};
```

以下使用方式都会被标记为 CSS Modules

```js
import styles from './index.css'
// Or
const styles = require('./index.css')
// Or
const styles = _anyFunctionWrap(require('./index.css'))
// Or
const styles = require('./index.css').default
```

## 参数

AutoCSSModulesWebpackPlugin 支持传入一个可选的 options 参数，具体字段如下:

|        Name         |     Type     |   Default   | Description                                 |
| :-----------------: | :----------: | :---------: | :------------------------------------------ |
|   **`queryFlag`**   |  `{string}`  | `'modules'` | 用来加到 request string 后面的 query 字符串 |
| **`extraExtnames`** | `{string[]}` |    `[]`     | 额外的样式文件后缀名                        |

默认支持的后缀名列表 `['.css', '.less', '.sass', '.scss', '.stylus', '.styl']`, 暂时只能新增不能覆盖.

## 如何工作的

因为 CSS Modules 的使用场景都是需要 import 或者 require 对应的 CSS 进来，然后值绑定到一个变量上，再通过这个变量使用样式。我们就可以分析文件的 ast，当符合这个场景时，就给引用的文件加个 query。例如 `import styles from './index.css'` 会转化为 `import styles from './index.css?modules'`。在 webpack 的一个 [hook](https://webpack.js.org/api/parser/#program) `parser.hooks.program` 上, 给了我们在它实际解析文件依赖前修改文件的 ast 的机会。

接着 webpack 可以通过 resourceQuery 给 loader 传入不同的 options，这样就区分开了普通 CSS 文件和 CSS Modules 文件，达到了自动配置的目的。

## 感谢

受 [@umijs/babel-plugin-auto-css-modules](https://www.npmjs.com/package/@umijs/babel-plugin-auto-css-modules) 的启发


## License

[MIT](./LICENSE)
