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

// extend the base template transform
class NewTemplateTransform extends TemplateTransform {
  genVIf (node) {
    // do something for v-if directive
  },
  genVFor (node) {
    // do something for v-for directive
  }
}

// get an instance
const newTemplateTranformer = new NewTemplateTransform({
  // some options
  prefix: 'foo'
})

// inject the origin vue template ast and call generate method of transformer instance to get the transformed template
const { code } = newTemplateTranformer.generate(ast)
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