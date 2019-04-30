import { isUnaryTag, removeQuotes, isNotEmpty, isBoolean } from './utils'
import {
  TemplateGenertorRes,
  BaseNodeAttr,
  NodeAttr,
  builtInDirectives,
  ASTNode
} from './types/index'
import DIRECTIVES from './directives'

enum TYPE {
  ELEMENT = 1,
  TEXT,
  STATIC_TEXT
}

// const bindReg = /^v-bind|^:/
// const tagStateReg = /focus/
const onReg = /^@|^v-on:/
const preserveBindingReg = /(^:|^v-bind:)(style|class|type|key)/
const customPropertyReg = /(^:|^v-bind:)([\s\S]+)/

const emptyBaseNodeAttr: BaseNodeAttr = {
  name: '',
  value: ''
}

export default class TemplateGenertor {
  ast: ASTNode
  options: object
  constructor(options = {}) {
    this.options = options
  }

  generate(ast: ASTNode): TemplateGenertorRes {
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

  genElement(node: ASTNode): string {
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

  genIfConditions(node: ASTNode): string {
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

  genNode(node: ASTNode): string {
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
      this.genVBind(node), // v-bind alias :
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
    ]

    const startTag = `<${[tag, ...directives, ...attrs]
      .filter(isNotEmpty)
      .join(' ')}${isUnary ? '/>' : '>'}`

    const endTag = isUnary ? '' : `</${tag}>`

    return [startTag, childrenNodes, endTag].join('')
  }

  genChildren(node: ASTNode): string {
    if (!node || !node.children || !node.children.length) {
      return ''
    }
    return node.children
      .map(child => this.genElement(child as ASTNode))
      .filter(isNotEmpty)
      .join('')
  }

  genTag(node: ASTNode): string {
    return node.tag
  }

  genText(node: ASTNode): string {
    const { text = '' } = node
    return text
  }

  genVIf(node: ASTNode): string {
    if (node.if) {
      return `${DIRECTIVES.if}="${node.if}"`
    } else if (node.elseif) {
      return `${DIRECTIVES.elseif}="${node.elseif}"`
    } else if (node.else) {
      return `${DIRECTIVES.else}`
    }
    return ''
  }
  genVFor(node: ASTNode): string {
    return <string>this.getDirectiveFromAttrsMap(node, 'for', true)
  }
  genKey(node: ASTNode): string {
    return <string>this.getPropFromAttrsMap(node, 'key', true)
  }
  genEvents(node: ASTNode): string {
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
  genVShow(node: ASTNode): string {
    return <string>this.getDirectiveFromAttrsMap(node, 'show', true)
  }
  genVModel(node: ASTNode): string {
    return <string>this.getDirectiveFromAttrsMap(node, 'model', true)
  }
  /**
   *
   * @param node
   * @returns return this props through v-bind or : property operator expect for style/class/type/key
   */
  genVBind(node: ASTNode): string {
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
  /**
   *
   * @param node
   * @returns return the original html element attrs, like id / placeholder / focus and so on.
   */
  genAttrs(node: ASTNode): string {
    const { attrs = [], attrsMap = {} } = node
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
  genIs(node: ASTNode): string {
    return <string>this.getPropFromAttrsMap(node, 'is', true)
  }
  genStyle(node: ASTNode): string {
    const bindStyle = <string>this.getPropFromAttrsMap(node, 'style', true)
    const staticStyle = <string>this.getDomAttrFromAttrsMap(node, 'style', true)
    return `${bindStyle} ${staticStyle}`
  }
  genClass(node: ASTNode): string {
    const bindClass = <string>this.getPropFromAttrsMap(node, 'class', true)
    const staticClass = <string>this.getDomAttrFromAttrsMap(node, 'class', true)
    return `${bindClass} ${staticClass}`
  }
  genVOnce(node: ASTNode): string {
    return <string>this.getDirectiveFromAttrsMap(node, 'once', true)
  }
  genVPre(node: ASTNode): string {
    return <string>this.getDirectiveFromAttrsMap(node, 'pre', true)
  }
  genVCloak(node: ASTNode): string {
    return <string>this.getDirectiveFromAttrsMap(node, 'cloak', true)
  }
  genVHtml(node: ASTNode): string {
    return <string>this.getDirectiveFromAttrsMap(node, 'html', true)
  }
  genVText(node: ASTNode): string {
    return <string>this.getDirectiveFromAttrsMap(node, 'text', true)
  }
  genRef(node: ASTNode): string {
    return <string>this.getDomAttrFromAttrsMap(node, 'ref', true)
  }
  genSlot(node: ASTNode): string {
    if (node.tag === 'slot') {
      return <string>this.getDomAttrFromAttrsMap(node, 'name', true)
    }
    return ''
  }
  getDirectiveFromAttrsMap(
    node: ASTNode,
    name: builtInDirectives,
    alias?: string | boolean,
    needNormalize?: boolean
  ): string | NodeAttr {
    if (isBoolean(alias)) {
      needNormalize = <boolean>alias
    }
    let res: BaseNodeAttr | NodeAttr
    const directive = DIRECTIVES[name] || DIRECTIVES[<builtInDirectives>alias]
    const emptyMap = Object.assign({}, emptyBaseNodeAttr)
    const { attrsMap = {} } = node
    if (!directive) {
      res = emptyMap
    } else {
      const dirReg = new RegExp(directive)
      const realDir = Object.keys(attrsMap).find(attr => dirReg.test(attr))
      res = realDir
        ? attrsMap[realDir]
          ? {
              name: realDir,
              value: `"${attrsMap[realDir]}"`
            }
          : Object.assign(emptyMap, {
              noMap: true
            })
        : emptyMap
    }
    return needNormalize ? this.normalizeMap(res) : res
  }
  // TODO:
  getPropFromAttrsMap(node: ASTNode, name: string, needNormalize?: boolean) {
    const { attrsMap = {} } = node
    const emptyMap = Object.assign({}, emptyBaseNodeAttr)
    const value =
      attrsMap[`:${name}`] || attrsMap[`${DIRECTIVES.bind}:${name}`]
    let res: BaseNodeAttr = !value
      ? emptyMap
      : { name: `:${name}`, value: `"${value}"` }
    return needNormalize ? this.normalizeMap(res) : res
  }
  getDomAttrFromAttrsMap(node: ASTNode, name: string, needNormalize?: boolean) {
    const { attrsMap = {} } = node
    const emptyMap = Object.assign({}, emptyBaseNodeAttr)
    let res: BaseNodeAttr
    if (attrsMap.hasOwnProperty(name)) {
      res = attrsMap[name] ? { name, value: `"${attrsMap[name]}"` } : emptyMap
    } else {
      res = emptyMap
    }
    return needNormalize ? this.normalizeMap(res) : res
  }
  normalizeMap(res: NodeAttr): string {
    const { name, value, noMap } = res
    if (noMap && name) {
      return name
    } else if (name && value) {
      return `${name}=${value}`
    } else {
      return ''
    }
  }
}
