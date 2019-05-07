import { ASTElement } from 'vue-template-compiler';
export declare type TemplateGenertorRes = {
    code: string;
};
export declare type BaseNodeAttr = {
    name: string;
    value: any;
};
export declare type ASTNode = ASTElement & {
    ifConditionsHasGenerated?: boolean;
};
export declare type NodeAttr = BaseNodeAttr & {
    noMap?: boolean;
};
export declare type builtInDirectives = 'text' | 'html' | 'show' | 'if' | 'else' | 'elseif' | 'for' | 'on' | 'bind' | 'model' | 'slot' | 'pre' | 'cloak' | 'once';
