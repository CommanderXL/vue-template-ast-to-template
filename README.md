## Vue-Template-Ast-To-Template

Transform compiled template ast to vue template.It expose all key vue template property hook for you to overwrite.So you can transform vue template to other template base on vue template ast.


### How to

#### Install 

```shell
npm install vue-template-transformer --save
```

#### Usage

```javascript
const TemplateTransform = require('vue-template-transformer')
// get an instance
const transformer = new TemplateTransform({
  // some options
  prefix: 'foo'
})

// call generate method to get the transformed template
const { code } = transformer.generate(ast)
```

All instance properties that can be overwrite:

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