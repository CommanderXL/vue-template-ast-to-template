import {
  isUnaryTag,
  removeQuotes,
  isNotEmpty,
  isBoolean
} from './utils'
import DIRECTIVES from './directives'

enum TYPE {
  ELEMENT = 1,
  TEXT,
  STATIC_TEXT
}

// interface AST {}
// interface Options {}
type TemplateGenertorRes = {
  code: string
}

// const bindReg = /^v-bind|^:/
// const tagStateReg = /focus/
const onReg = /^@|^v-on:/
const preserveBindingReg = /(^:|^v-bind:)(style|class|type|key)/
const customPropertyReg = /(^:|^v-bind:)([\s\S]+)/
const empty = { name: '', value: '' }

export default class TemplateGenertor {
  ast: object
  options: object
  constructor(options = {}) {
    this.options = options
  }

  generate(ast): TemplateGenertorRes {
    const res: TemplateGenertorRes = {
      code: ''
    }
    if (!ast) {
      return res
    }
    this.ast = ast
    res.code = this.genElement(this.ast)
    return res
  }

  genElement(node) {
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

  genIfConditions(node) {
    node.ifConditionsHasGenerated = true

    if (!node.ifConditions) {
      return ''
    }

    return node.ifConditions
      .map(item => {
        const { block } = item
        return this.genElement(block)
      })
      .filter(isNotEmpty)
      .join('')
  }

  genNode(node) {
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

    const startTag = `<${[tag, ...directives, ...attrs]
      .filter(isNotEmpty)
      .join(' ')}${isUnary ? '/>' : '>'}`

    const endTag = isUnary ? '' : `</${tag}>`

    return [startTag, childrenNodes, endTag].join('')
  }

  genChildren(node) {
    if (!node || !node.children || !node.children.length) {
      return ''
    }
    return node.children
      .map(child => this.genElement(child))
      .filter(isNotEmpty)
      .join('')
  }

  genTag(node) {
    return node.tag
  }

  genText(node) {
    const { text = '' } = node
    return text
  }

  genVIf(node) {
    if (node.if) {
      return `${DIRECTIVES['if']}="${node.if}"`
    } else if (node.elseif) {
      return `${DIRECTIVES['elseif']}="${node.elseif}"`
    } else if (node.else) {
      return `${DIRECTIVES['else']}`
    }
    return ''
  }
  genVFor(node) {
    return this.getDirectiveFromAttrsMap(node, 'for', true)
  }
  genKey(node) {
    return this.getPropFromAttrsMap(node, 'key', true)
  }
  genEvents(node) {
    const { attrsMap = {} } = node
    return Object.keys(attrsMap)
      .map(attr => {
        if (onReg.test(attr)) {
          return `${attr}="${attrsMap[attr]}"`
        }
        return ''
      })
      .filter(isNotEmpty)
      .join(' ')
  }
  genVShow(node) {
    return this.getDirectiveFromAttrsMap(node, 'show', true)
  }
  genVModel(node) {
    return this.getDirectiveFromAttrsMap(node, 'model', true)
  }
  genVBind(node) {
    const { attrsMap = {} } = node
    return Object.keys(attrsMap)
      .map(attr => {
        const isPreservedProperty = preserveBindingReg.test(attr)
        if (isPreservedProperty) {
          return ''
        }

        const matched = attr.match(customPropertyReg)
        if (matched) {
          return `${matched[0]}="${attrsMap[attr]}"`
        }
        return ''
      })
      .filter(isNotEmpty)
      .join(' ')
  }
  genAttrs(node) {
    const { attrs = [], attrsMap = [] } = node
    if (!attrs.length) {
      return ''
    }
    const attrsMapKeys = Object.keys(attrsMap)

    return attrs
      .map(attr => {
        const { name, value } = attr
        return attrsMapKeys.find(
          attr => `:${name}` === attr || `v-bind:${name}` === attr
        )
          ? ''
          : value === '""'
          ? `${name}`
          : `${name}="${removeQuotes(value)}"`
      })
      .filter(isNotEmpty)
      .join(' ')
  }
  genIs(node) {
    return this.getPropFromAttrsMap(node, 'is', true)
  }
  genStyle(node) {
    const bindStyle = this.getPropFromAttrsMap(node, 'style', true)
    const staticStyle = this.getDomAttrFromAttrsMap(node, 'style', true)
    return `${bindStyle} ${staticStyle}`
  }
  genClass(node) {
    const bindClass = this.getPropFromAttrsMap(node, 'class', true)
    const staticClass = this.getDomAttrFromAttrsMap(node, 'class', true)
    return `${bindClass} ${staticClass}`
  }
  genVOnce(node) {
    return this.getDirectiveFromAttrsMap(node, 'once', true)
  }
  genVPre(node) {
    return this.getDirectiveFromAttrsMap(node, 'pre', true)
  }
  genVCloak(node) {
    return this.getDirectiveFromAttrsMap(node, 'cloak', true)
  }
  genVHtml(node) {
    return this.getDirectiveFromAttrsMap(node, 'html', true)
  }
  genVText(node) {
    return this.getDirectiveFromAttrsMap(node, 'text', true)
  }
  genRef(node) {
    return this.getDomAttrFromAttrsMap(node, 'ref', true)
  }
  genSlot(node) {
    if (node.tag === 'slot') {
      return this.getDomAttrFromAttrsMap(node, 'name', true)
    }
    return ''
  }
  getDirectiveFromAttrsMap(node, name, alias, needNormalize) {
    if (isBoolean(alias)) {
      needNormalize = alias
    }
    let res
    const directive = DIRECTIVES[name] || DIRECTIVES[alias]
    const emptyMap = Object.assign({}, empty)
    const { attrsMap = {} } = node
    if (!directive) {
      res = emptyMap
    } else {
      const dirReg = new RegExp(directive)
      const realDir = Object.keys(attrsMap).find(attr => dirReg.test(attr))
      res = realDir
        ? attrsMap[realDir]
          ? { name: realDir, value: `"${attrsMap[realDir]}"` }
          : Object.assign(emptyMap, { noMap: true })
        : emptyMap
    }
    return needNormalize ? this.normalizeMap(res) : res
  }
  // TODO:
  getPropFromAttrsMap(node, name, needNormalize) {
    const { attrsMap = {} } = node
    const emptyMap = Object.assign({}, empty)
    const value =
      attrsMap[`:${name}`] || attrsMap[`${DIRECTIVES['bind']}:${name}`]
    let res = !value ? emptyMap : { name: `:${name}`, value: `"${value}"` }
    return needNormalize ? this.normalizeMap(res) : res
  }
  getDomAttrFromAttrsMap(node, name, needNormalize) {
    const { attrsMap = {} } = node
    const emptyMap = Object.assign({}, empty)
    let res
    if (attrsMap.hasOwnProperty(name)) {
      res = attrsMap[name] ? { name, value: `"${attrsMap[name]}"` } : emptyMap
    } else {
      res = emptyMap
    }
    return needNormalize ? this.normalizeMap(res) : res
  }
  normalizeMap(res) {
    const { name, value, noMap } = res
    if (noMap) {
      return name
    } else if (name && value) {
      return `${name}=${value}`
    } else {
      return ''
    }
  }
}
