module.exports = function (source) {
  return `module.exports = ${JSON.stringify({
    source,
    query: this.query,
  })}`
}
