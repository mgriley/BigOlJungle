import { gNodeDataMap } from './NodeDataMap.js'
import { extendMap } from '../Utils.js'

import { Node } from '../Node.js'
import NodeWidget from './NodeWidget.vue'
import NodeWidgetEditor from './NodeWidgetEditor.vue'

import { TextNode } from './TextNode.js'
import TextWidget from './TextWidget.vue'
import TextWidgetEditor from './TextWidgetEditor.vue'

import { ImageNode } from './ImageNode.js'
import ImageWidget from './ImageWidget.vue'
import ImageWidgetEditor from './ImageWidgetEditor.vue'

import { RectNode } from './RectNode.js'
import RectWidget from './RectWidget.vue'
import RectWidgetEditor from './RectWidgetEditor.vue'

import { LinkNode } from './LinkNode.js'
import LinkWidget from './LinkWidget.vue'
import LinkWidgetEditor from './LinkWidgetEditor.vue'

// Register all nodes types here
export function registerNodeTypes() {
  console.log("Registering node types...");
  extendMap(gNodeDataMap, {
    "Node": {
      uiName: "Node",
      nodeClass: Node,
      widget: NodeWidget,
      editor: NodeWidgetEditor,
    },
    "TextNode": {
      uiName: "Text",
      nodeClass: TextNode,
      widget: TextWidget,
      editor: TextWidgetEditor,
    },
    "ImageNode": {
      uiName: "Image",
      nodeClass: ImageNode,
      widget: ImageWidget,
      editor: ImageWidgetEditor,
    },
    "RectNode": {
      uiName: "Rect",
      nodeClass: RectNode,
      widget: RectWidget,
      editor: RectWidgetEditor,
    },
    "LinkNode": {
      uiName: "Link",
      nodeClass: LinkNode,
      widget: LinkWidget,
      editor: LinkWidgetEditor,
    },
  });
}

