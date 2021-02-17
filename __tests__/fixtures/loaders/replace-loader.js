module.exports = function (source) {
  const replace = this.query && this.query.replace ? this.query.replace : null

  return replace ? source.replace(new RegExp(replace.from, 'g'), replace.to) : source
}
