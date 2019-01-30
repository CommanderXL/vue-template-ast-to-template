class TemplateGenertor {
  constructor (ast, options = {}) {
    this.ast = ast
    this.options = options
  }

  generate () {
    const res = {
      code: ''
    }
    if (!this.ast) {
      return res
    }
    res.code = this.genElement(this.ast)
    return res
  }

  genElement() {}
}