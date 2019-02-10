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

// overwrite exposed methods of the transformer instance and do something you like
Object.assign(transformer, {
  genVIf (node) {
    // do something for v-if directive
  },
  genVFor (node) {
    // do something for v-for directive
  }
  ...
})

// inject the origin vue template ast and call generate method of transformer instance to get the transformed template
const { code } = transformer.generate(ast)
```

All instance properties that can be overwrite:

### Directives

* genVIf(`v-if`)
* genVFor(`v-for`)
* genEvents(`v-on|@`)
* genVShow(`v-show`)
* genVModel(`v-model`)
* genVOnce(`v-once`)
* genVBind(`v-bind|:`)
* genVCloak(`v-cloak`)
* genVHtml(`v-html`)
* genVPre(`v-pre`)
* genVText(`v-text`)

### Attrs

* genAttrs
* genStyle
* genClass
* genKey
* genIs
* genRef
* genSlot
* genScopedSlot