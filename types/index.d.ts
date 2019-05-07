import {
  TemplateGenertorRes,
  BaseNodeAttr,
  NodeAttr,
  builtInDirectives,
  ASTNode
} from './types'

export interface TemplateGenertor {
  ast: ASTNode
  options: object

  generate(ast: ASTNode): TemplateGenertorRes
  genElement(node: ASTNode): string
  genIfConditions(node: ASTNode): string
  genNode(node: ASTNode): string
  genChildren(node: ASTNode): string
  genTag(node: ASTNode): string
  genText(node: ASTNode): string
  genVIf(node: ASTNode): string
  genVFor(node: ASTNode): string
  genKey(node: ASTNode): string
  genEvents(node: ASTNode): string
  genVShow(node: ASTNode): string
  genVModel(node: ASTNode): string
  genVBind(node: ASTNode): string
  genAttrs(node: ASTNode): string
  genIs(node: ASTNode): string
  genStyle(node: ASTNode): string
  genClass(node: ASTNode): string
  genVOnce(node: ASTNode): string
  genVPre(node: ASTNode): string
  genVCloak(node: ASTNode): string
  genVHtml(node: ASTNode): string
  genVText(node: ASTNode): string
  genRef(node: ASTNode): string
  genSlot(node: ASTNode): string
  getDirectiveFromAttrsMap(
    node: ASTNode,
    name: builtInDirectives,
    alias?: string | boolean,
    needNormalize?: boolean
  ): string | NodeAttr
  getPropFromAttrsMap(
    node: ASTNode,
    name: string,
    needNormalize?: boolean
  ): string | NodeAttr
  getDomAttrFromAttrsMap(
    node: ASTNode,
    name: string,
    needNormalize?: boolean
  ): string | NodeAttr
  normalizeMap(res: NodeAttr): string
}