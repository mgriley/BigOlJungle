import NodeWidget from './NodeWidget.vue'
import NodeWidgetEditor from './NodeWidgetEditor.vue'
import TextWidget from './TextWidget.vue'
import TextWidgetEditor from './TextWidgetEditor.vue'

// Note: use :is="kWidgetMap[compName]" in dynamic components. I tried passing by
// string name and it did not work correctly.
let kWidgetMap = {
  "NodeWidget": NodeWidget,
  "TextWidget": TextWidget,
}

let kEditorMap = {
  "NodeWidget": NodeWidgetEditor,
  "TextWidget": TextWidgetEditor,
}

export {
  kWidgetMap,
  kEditorMap,
  NodeWidget,
  TextWidget,
}
