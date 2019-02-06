## Vue-Template-Ast-To-Template

Transform compiled template ast to vue template.It expose all key vue template property hook for you to overwrite.So you can transform vue template to other template base on vue.


### How to


All properties that can be overwrite:

### Directives

* genVIf
* genVFor
* genEvents
* genVShow
* genVModel
* genVOnce
* genVBind
* genVCloak
* genVHtml
* genVPre
* genVText

### Attrs

* genAttrs
* genStyle
* genClass
* genKey
* genIs
* genRef
* genSlot
* genScopedSlot