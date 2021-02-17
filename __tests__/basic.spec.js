const path = require('path')
const fs = require('fs-extra')

const webpack4 = require('./fixtures/webpack4/node_modules/webpack')
const webpack5 = require('./fixtures/webpack5/node_modules/webpack')
const AutoCSSModulesWebpackPlugin = require('../index')

const OUTPUT_DIR = path.join(__dirname, 'dist')
const LESS_CONTENT = fs.readFileSync(path.join(__dirname, 'fixtures/dep.less'), {
  encoding: 'utf-8',
})
const OTHER_CONTENT = fs.readFileSync(path.join(__dirname, 'fixtures/dep.other'), {
  encoding: 'utf-8',
})

function buildWithWebpack(webpack, config, { queryFlag = 'modules', replace } = {}) {
  const mergedConfig = {
    mode: 'development',
    devtool: false,
    output: {
      path: OUTPUT_DIR,
      filename: 'bundle.js',
    },
    resolveLoader: {
      modules: ['node_modules', path.join(__dirname, 'fixtures/loaders')],
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          loader: 'replace-loader',
          options: {
            replace,
          },
        },
        {
          test: /\.(less|other)$/,
          oneOf: [
            {
              resourceQuery: new RegExp(queryFlag),
              loader: 'test-loader',
              options: {
                module: true,
              },
            },
            {
              loader: 'test-loader',
            },
          ],
        },
      ],
    },
    ...config,
    entry: path.join(__dirname, `fixtures/${config.entry || 'index.js'}`),
  }

  return new Promise((resolve, reject) => {
    webpack(mergedConfig, (err, stats) => {
      if (err) {
        return reject(err)
      }

      const info = stats.toJson()

      if (stats.hasErrors()) {
        return reject(info.errors)
      }

      resolve(stats)
    })
  })
}

function createExpect(content, module) {
  return JSON.stringify({
    source: content,
    query: module ? { module: true } : '',
  })
}

function readOutput() {
  return fs.readFile(path.join(__dirname, 'dist/bundle.js'), { encoding: 'utf-8' })
}

/**
 * Create test cases with different webpack
 */
function createTestWithWebpack(webpack) {
  return () => {
    describe('ImportDeclaration', () => {
      it('add mark when has specifiers', async () => {
        await buildWithWebpack(webpack, {
          entry: 'import-modules-dep.js',
          plugins: [new AutoCSSModulesWebpackPlugin()],
        })

        expect(await readOutput()).toContain(createExpect(LESS_CONTENT, true))
      })

      it('not add mark when no specifiers', async () => {
        await buildWithWebpack(webpack, {
          entry: 'import-dep.js',
          plugins: [new AutoCSSModulesWebpackPlugin()],
        })

        expect(await readOutput()).toContain(createExpect(LESS_CONTENT, false))
      })
    })

    describe('CommonJs Require', () => {
      it('add mark when assign result to a variable', async () => {
        await buildWithWebpack(webpack, {
          entry: 'require-modules-dep.js',
          plugins: [new AutoCSSModulesWebpackPlugin()],
        })

        expect(await readOutput()).toContain(createExpect(LESS_CONTENT, true))
      })

      it('not add mark when not assign to a variable', async () => {
        await buildWithWebpack(webpack, {
          entry: 'require-dep.js',
          plugins: [new AutoCSSModulesWebpackPlugin()],
        })

        expect(await readOutput()).toContain(createExpect(LESS_CONTENT, false))
      })

      it('works with single wrapped require call', async () => {
        await buildWithWebpack(webpack, {
          entry: 'require-wrapped.js',
          plugins: [new AutoCSSModulesWebpackPlugin()],
        })

        expect(await readOutput()).toContain(createExpect(LESS_CONTENT, true))
      })
    })

    it('works with other queryFlag', async () => {
      await buildWithWebpack(
        webpack,
        {
          entry: 'import-modules-dep.js',
          plugins: [new AutoCSSModulesWebpackPlugin({ queryFlag: 'my_custom_flag' })],
        },
        { queryFlag: 'my_custom_flag' }
      )

      expect(await readOutput()).toContain(createExpect(LESS_CONTENT, true))
    })

    it('not works when queryFlag mismatch', async () => {
      await buildWithWebpack(webpack, {
        entry: 'import-modules-dep.js',
        plugins: [new AutoCSSModulesWebpackPlugin({ queryFlag: 'my_custom_flag' })],
      })

      expect(await readOutput()).toContain(createExpect(LESS_CONTENT, false))
    })

    it('works with other extname', async () => {
      await buildWithWebpack(
        webpack,
        {
          entry: 'import-modules-dep.js',
          plugins: [new AutoCSSModulesWebpackPlugin({ extraExtnames: ['.other'] })],
        },
        {
          replace: { from: '\\.less', to: '.other' },
        }
      )

      expect(await readOutput()).toContain(createExpect(OTHER_CONTENT, true))
    })

    it('not works when extname not in extname list', async () => {
      await buildWithWebpack(
        webpack,
        {
          entry: 'import-modules-dep.js',
          plugins: [new AutoCSSModulesWebpackPlugin()],
        },
        {
          replace: { from: '\\.less', to: '.other' },
        }
      )

      expect(await readOutput()).toContain(createExpect(OTHER_CONTENT, false))
    })
  }
}

describe('AutoCSSModulesWebpackPlugin', () => {
  beforeEach(() => fs.remove(OUTPUT_DIR))

  describe('webpack4', createTestWithWebpack(webpack4))
  describe('webpack5', createTestWithWebpack(webpack5))
})
