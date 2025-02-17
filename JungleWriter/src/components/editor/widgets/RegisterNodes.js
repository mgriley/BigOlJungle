import { gNodeDataMap } from './NodeDataMap.js'
import { extendMap } from '../Utils.js'

import { Node } from '../State.js'
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

/*
import { LinksNode } from './LinksNode.js'
import LinksWidget from './LinksWidget.vue'
import LinksWidgetEditor from './LinksWidgetEditor.vue'
*/

/*
import { OmniNode } from './OmniNode.js'
import OmniWidget from './OmniWidget.vue'
import OmniWidgetEditor from './OmniWidgetEditor.vue'
*/

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
    /*
    "LinksNode": {
      uiName: "Links",
      nodeClass: LinksNode,
      widget: LinksWidget,
      editor: LinksWidgetEditor,
    },
    */
    /*
    "OmniNode": {
      uiName: "Omni",
      nodeClass: OmniNode,
      widget: OmniWidget,
      editor: OmniWidgetEditor,
    },
    */
  });
}

