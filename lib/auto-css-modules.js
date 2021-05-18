const { ancestor } = require('acorn-walk')
const { extname } = require('path')

const CSS_EXTNAMES = ['.css', '.less', '.sass', '.scss', '.stylus', '.styl']

/**
 * @typedef {Object} AutoCssModulesWebpackPluginOptions
 * @property {string} queryFlag
 * @property {Array<string>} extraExtnames
 */

/**
 * @param {AutoCssModulesWebpackPluginOptions} options
 */
function makeVisitor({ queryFlag = 'modules', extraExtnames = [] } = {}) {
  const extnames = [].concat(CSS_EXTNAMES).concat(extraExtnames)

  function isCallExpression(node) {
    return node.type === 'CallExpression'
  }

  function isMemberExpression(node) {
    return node.type === 'MemberExpression'
  }

  function isVariableDeclarator(node) {
    return node.type === 'VariableDeclarator'
  }

  return {
    ImportDeclaration(node) {
      const {
        specifiers,
        source,
        source: { value },
      } = node
      if (specifiers.length && extnames.includes(extname(value))) {
        source.value = `${value}?${queryFlag}`
      }
    },
    CallExpression(node, st, ancestors) {
      const callee = node.callee
      const parentNode = ancestors[ancestors.length - 2]
      const grandparentNode = ancestors[ancestors.length - 3]

      if (!parentNode) return

      if (callee.type !== 'Identifier' || callee.name !== 'require') return

      if (
        ((isCallExpression(parentNode) || isMemberExpression(parentNode)) &&
          grandparentNode &&
          isVariableDeclarator(grandparentNode)) ||
        isVariableDeclarator(parentNode)
      ) {
        const target = node.arguments[0]

        if (
          target &&
          target.type === 'Literal' &&
          extnames.includes(extname(target.value))
        ) {
          target.value = `${target.value}?${queryFlag}`
        }
      }
    },
  }
}

class AutoCssModulesWebpackPlugin {
  /**
   * @param {AutoCssModulesWebpackPluginOptions} optoins
   */
  constructor({ queryFlag = 'modules', extraExtnames = [] } = {}) {
    this.astVisitor = makeVisitor({ queryFlag, extraExtnames })
  }

  /**
   *
   * @param {*} compiler
   */
  apply(compiler) {
    compiler.hooks.compilation.tap(
      'AutoCssModulesWebpackPlugin',
      (compilation, { normalModuleFactory }) => {
        const handler = (parser) => {
          parser.hooks.program.tap('AutoCssModuleParserAstPlugin', (ast) => {
            ancestor(ast, this.astVisitor)
          })
        }

        normalModuleFactory.hooks.parser
          .for('javascript/auto')
          .tap('AutoCssModuleParserPlugin', handler)
        normalModuleFactory.hooks.parser
          .for('javascript/dynamic')
          .tap('AutoCssModuleParserPlugin', handler)
        normalModuleFactory.hooks.parser
          .for('javascript/esm')
          .tap('AutoCssModuleParserPlugin', handler)
      }
    )
  }
}

AutoCssModulesWebpackPlugin.makeVisitor = makeVisitor

module.exports = AutoCssModulesWebpackPlugin
