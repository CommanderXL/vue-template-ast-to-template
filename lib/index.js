const { isUnaryTag } = require('./utils')

const TYPE = {
  ELEMENT: 1,
  TEXT: 2,
  STATIC_TEXT: 3
}

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

  genElement (node) {
    if (node.type === TYPE.ELEMENT) {
      return this.genNode(node)
    } else if (node.type === TYPE.TEXT || node.type === TYPE.STATIC_TEXT) {
      return this.genText(node)
    }
  }

  genNode (node) {
    const tag = this.genTag(node)
    const isUnary = isUnaryTag(tag)
    const childrenNodes = this.genChildren(node)

    const directives = [
      this.genIf(node),
      this.genFor(node),
      this.genEvents(node),
      this.genVShow(node),
      this.genVModel(node),
      this.genProps(node),
      this.genIs(node)
    ]

    const attrs = [
      this.genAttrs(node),
      this.genStyle(node),
      this.genClass(node)
    ]

    const startTag = `<${[
      tag,
      ...directives,
      ...attrs
    ].filter(isNotEmpty).join(' ')}${isUnary ? '/>' : '>'}`

    const endTag = isUnary ? '' : `</${tag}>`

    return [startTag, childrenNodes, endTag].join('')
  }

  genTag (node) {
    return node.tag
  }

  genIf (node) {
    
  }
  genFor (node) {}
  genEvents (node) {}
  genVShow (node) {}
  genVModel (node) {}
  genProps (node) {}
  genIs (node) {}
  genAttrs (node) {}
  genStyle (node) {}
  genClass (node) {}
}