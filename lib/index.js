const { isUnaryTag, removeQuotes, isNotEmpty } = require('./utils')
const DIRECTIVES = require('./directives')

const TYPE = {
  ELEMENT: 1,
  TEXT: 2,
  STATIC_TEXT: 3
}

// const bindReg = /^v-bind|^:/
// const tagStateReg = /focus/
const onReg = /^@|^v-on:/
const preserveBindingReg = /(^:|^v-bind:)(style|class|type|key)/
const customPropertyReg = /(^:|^v-bind:)([\s\S]+)/

module.exports = class TemplateGenertor {
  constructor (options = {}) {
    this.ast = null
    this.options = options
  }

  generate (ast) {
    const res = {
      code: ''
    }
    if (!ast) {
      return res
    }
    this.ast = ast
    res.code = this.genElement(this.ast)
    return res
  }

  genElement (node) {
    if (!node) {
      return ''
    } else if (node.ifConditions && !node.ifConditionsHasGenerated) {
      return this.genIfConditions(node)
    } else if (node.type === TYPE.ELEMENT) {
      return this.genNode(node)
    } else if (node.type === TYPE.TEXT || node.type === TYPE.STATIC_TEXT) {
      return this.genText(node)
    } else {
      return ''
    }
  }

  genIfConditions (node) {
    node.ifConditionsHasGenerated = true

    if (!node.ifConditions) {
      return ''
    }

    return node.ifConditions.map(item => {
      const { block } = item
      return this.genElement(block)
    }).filter(isNotEmpty).join('')
  }

  genNode (node) {
    const tag = this.genTag(node)
    const isUnary = isUnaryTag(tag)
    const childrenNodes = this.genChildren(node)

    const directives = [
      this.genVIf(node),
      this.genVFor(node),
      this.genEvents(node),
      this.genVShow(node),
      this.genVModel(node),
      this.genVOnce(node),
      this.genVBind(node), // :
      this.genVCloak(node),
      this.genVHtml(node),
      this.genVPre(node),
      this.genVText(node)
    ]
    
    const attrs = [
      this.genAttrs(node),
      this.genStyle(node),
      this.genClass(node),
      // 特殊特性
      this.genKey(node),
      this.genIs(node),
      this.genRef(node),
      this.genSlot(node)
      // TODO: 作用域插槽
    ]

    const startTag = `<${[
      tag,
      ...directives,
      ...attrs
    ].filter(isNotEmpty).join(' ')}${isUnary ? '/>' : '>'}`

    const endTag = isUnary ? '' : `</${tag}>`

    return [startTag, childrenNodes, endTag].join('')
  }

  genChildren (node) {
    if (!node || !node.children || !node.children.length) {
      return ''
    }
    return node.children.map(child => this.genElement(child)).filter(isNotEmpty).join('')
  }

  genTag (node) {
    return node.tag
  }

  genText (node) {
    const { text = '' } = node
    return text
  }

  genVIf (node) {
    if (node.if) {
      return `${DIRECTIVES['if']}="${node.if}"`
    } else if (node.elseif) {
      return `${DIRECTIVES['elseif']}="${node.elseif}"`
    } else if (node.else) {
      return `${DIRECTIVES['else']}`
    }
    return ''
  }
  genVFor (node) {
    return this.getDirectiveFromAttrsMap(node, 'for')
  }
  genKey (node) {
    return this.getPropFromAttrsMap(node, 'key')
  }
  genEvents (node) {
    const { attrsMap = {} } = node
    return Object.keys(attrsMap).map(attr => {
      if (onReg.test(attr)) {
        return `${attr}="${attrsMap[attr]}"`
      }
      return ''
    }).filter(isNotEmpty).join(' ')
  }
  genVShow (node) {
    return this.getDirectiveFromAttrsMap(node, 'show')
  }
  genVModel (node) {
    return this.getDirectiveFromAttrsMap(node, 'model')
  }
  genVBind (node) {
    const { attrsMap = {} } = node
    return Object.keys(attrsMap).map(attr => {
      const isPreservedProperty = preserveBindingReg.test(attr)
      if (isPreservedProperty) {
        return ''
      }

      const matched = attr.match(customPropertyReg)
      if (matched) {
        return `${matched[0]}="${attrsMap[attr]}"`
      }
      return ''
    }).filter(isNotEmpty).join(' ')
  }
  genAttrs (node) {
    const { attrs = [], attrsMap = [] } = node
    if (!attrs.length) {
      return ''
    }
    const attrsMapKeys = Object.keys(attrsMap)

    return attrs.map(attr => {
      const { name, value } = attr
      return attrsMapKeys.find(attr => `:${name}` === attr || `v-bind:${name}` === attr)
        ? ''
        : value === '""'
          ? `${name}`
          : `${name}="${removeQuotes(value)}"`
    }).filter(isNotEmpty).join(' ')
  }
  genIs (node) {
    return this.getPropFromAttrsMap(node, 'is')
  }
  genStyle (node) {
    const bindStyle = this.getPropFromAttrsMap(node, 'style')
    const staticStyle = this.getDomAttrFromAttrsMap(node, 'style')
    return `${bindStyle} ${staticStyle}`
  }
  genClass (node) {
    const bindClass = this.getPropFromAttrsMap(node, 'class')
    const staticClass = this.getDomAttrFromAttrsMap(node, 'class')
    return `${bindClass} ${staticClass}`
  }
  genVOnce (node) {
    return this.getDirectiveFromAttrsMap(node, 'once')
  }
  genVPre (node) {
    return this.getDirectiveFromAttrsMap(node, 'pre')
  }
  genVCloak (node) {
    return this.getDirectiveFromAttrsMap(node, 'cloak')
  }
  genVHtml (node) {
    return this.getDirectiveFromAttrsMap(node, 'html')
  }
  genVText (node) {
    return this.getDirectiveFromAttrsMap(node, 'text')
  }
  genRef (node) {
    return this.getDomAttrFromAttrsMap(node, 'ref')
  }
  genSlot (node) {
    if (node.tag === 'slot') {
      return this.getDomAttrFromAttrsMap(node, 'name')
    }
    return ''
  }
  getDirectiveFromAttrsMap (node, name, alias) {
    const directive = DIRECTIVES[name] || DIRECTIVES[alias]
    const { attrsMap = {} } = node
    if (!directive) {
      return ''
    }
    const dirReg = new RegExp(directive)
    const realDir = Object.keys(attrsMap).find(attr => dirReg.test(attr))
    return realDir
      ? attrsMap[realDir]
        ? `${realDir}="${attrsMap[realDir]}"`
        : `${realDir}`
      : ''
  }
  // TODO:
  getPropFromAttrsMap (node, name) {
    const { attrsMap = {} } = node
    const value = attrsMap[`:${name}`] || attrsMap[`${DIRECTIVES['bind']}:${name}`]
    if (!value) {
      return ''
    }
    return `:${name}="${value}"`
  }
  getDomAttrFromAttrsMap (node, name) {
    const { attrsMap = {} } = node
    if (attrsMap.hasOwnProperty(name)) {
      return attrsMap[name]
        ? `${name}="${attrsMap[name]}"`
        : ''
    }
    return ''
  }
}