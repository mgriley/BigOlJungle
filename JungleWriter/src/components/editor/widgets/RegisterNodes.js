import { gNodeDataMap } from './NodeDataMap.js'
import { extendMap } from '../Utils.js'

import { Node } from '../State.js'
import NodeWidget from './NodeWidget.vue'
import NodeWidgetEditor from './NodeWidgetEditor.vue'

import { TextNode } from './TextNode.js'
import TextWidget from './TextWidget.vue'
import TextWidgetEditor from './TextWidgetEditor.vue'

// Register all nodes types here
export function registerNodeTypes() {
  console.log("Registering node types...");
  extendMap(gNodeDataMap, {
    "Node": {
      nodeClass: Node,
      widget: NodeWidget,
      editor: NodeWidgetEditor
    },
    "TextNode": {
      nodeClass: TextNode,
      widget: TextWidget,
      editor: TextWidgetEditor
    }
  });
}

