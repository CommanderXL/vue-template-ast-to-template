import { ASTElement } from 'vue-template-compiler'

export type TemplateGenertorRes = {
  code: string
}

export type BaseNodeAttr = {
  name: string
  value: any
}

export type ASTNode = ASTElement & {
  ifConditionsHasGenerated?: boolean
}

export type NodeAttr = BaseNodeAttr & {
  noMap?: boolean
}

export type builtInDirectives =
  | 'text'
  | 'html'
  | 'show'
  | 'if'
  | 'else'
  | 'elseif'
  | 'for'
  | 'on'
  | 'bind'
  | 'model'
  | 'slot'
  | 'pre'
  | 'cloak'
  | 'once'
