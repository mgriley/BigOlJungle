import TextWidget from './TextWidget.vue'
import TextWidgetEditor from './TextWidgetEditor.vue'

// Note: use :is="kWidgetMap[compName]" in dynamic components. I tried passing by
// string name and it did not work correctly.
let kWidgetMap = {
  "TextWidget": TextWidget,
}

let kEditorMap = {
  "TextWidget": TextWidgetEditor,
}

export {
  kWidgetMap,
  kEditorMap,
  TextWidget,
}
