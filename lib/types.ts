export type TemplateGenertorRes = {
  code: string
}

export type BaseNodeAttr = {
  name: string
  value: string
}

export type NodeAttr = BaseNodeAttr & {
  noMap?: boolean
}

export type ASTNode = {
  tag: string
  type: number
  children: Array<Node>
  attrs: Array<BaseNodeAttr>
  attrsList: Array<BaseNodeAttr>
  attrsMap: object
  parent: undefined | Node
  plain: boolean
  static: boolean
  staticClass: string
  staticRoot: boolean
  text: string
}

export type builtInDirectives = 'for' | 'show' | 'model' | 'once' | 'cloak' | 'html' | 'bind' | 'pre' | 'text' | 'class' | 'style'