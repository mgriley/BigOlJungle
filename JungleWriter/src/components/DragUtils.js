import { gApp } from './State.js'
import { Node } from './Node.js'

/*
dragFuncs {
  // Returns whether or not to allow the drag. (Called before onStart)
  allowDrag() -> Bool,
  onStart(startX, startY),
  onUpdate(startX, startY, curX, curY),
  onEnd(startX, startY, endX, endY)
}
*/
export function makeDraggableExt(element, dragFuncs) {
  if (!element) {
    console.warn("makeDraggableExt: No element!");
    return;
  }
  var startX = null;
  var startY = null;
  var curX = null;
  var curY = null;
  var constraintDirection = null; // 'horizontal', 'vertical', or null
  var hasDragged = false; // Track if actual dragging occurred

  let dragPointerDown = null;
  let elementDrag = null;
  let closeDragElement = null;
  let preventClick = null;

  dragPointerDown = (e) => {
    e = e || window.event;

    let allowDrag = true;
    if (dragFuncs.allowDrag) {
      allowDrag = dragFuncs.allowDrag();
    }

    if (allowDrag) {
      e.preventDefault();
      e.stopPropagation();
      startX = e.clientX;
      startY = e.clientY;
      curX = startX;
      curY = startY;
      constraintDirection = null; // Reset constraint direction
      hasDragged = false; // Reset drag flag
      element.setPointerCapture(e.pointerId);
      document.addEventListener("pointerup", closeDragElement);
      document.addEventListener("pointermove", elementDrag);
      if (dragFuncs.onStart) {
        dragFuncs.onStart(startX, startY);
      }
    }
  }

  elementDrag = (e) => {
    e = e || window.event;
    e.preventDefault();
    e.stopPropagation();
    
    let newX = e.clientX;
    let newY = e.clientY;
    
    // Check if we've moved enough to consider this a drag
    let deltaX = Math.abs(newX - startX);
    let deltaY = Math.abs(newY - startY);
    if (deltaX > 3 || deltaY > 3) {
      hasDragged = true;
    }
    
    // If shift is pressed, constrain movement to horizontal or vertical
    if (e.shiftKey) {
      // Only determine constraint direction if we haven't already and there's enough movement
      if (!constraintDirection && (deltaX > 5 || deltaY > 5)) {
        constraintDirection = deltaX > deltaY ? 'horizontal' : 'vertical';
      }
      
      // Apply the constraint based on the determined direction
      if (constraintDirection === 'horizontal') {
        newY = startY;
      } else if (constraintDirection === 'vertical') {
        newX = startX;
      }
    } else {
      // Reset constraint direction when shift is released
      constraintDirection = null;
    }
    
    curX = newX;
    curY = newY;
    
    if (dragFuncs.onUpdate) {
      dragFuncs.onUpdate(startX, startY, curX, curY);
    }
  }

  closeDragElement = (e) => {
    document.removeEventListener("pointerup", closeDragElement);
    document.removeEventListener("pointermove", elementDrag);
    if (e && e.pointerId) {
      element.releasePointerCapture(e.pointerId);
    }
    
    // If we dragged, prevent the next click event.
    // This prevents XXXWidget.onClick from firing after a drag and selecting/deselecting things.
    if (hasDragged) {
      element.addEventListener("click", preventClick, { capture: true, once: true });
    }
    
    if (dragFuncs.onEnd) {
      dragFuncs.onEnd(startX, startY, curX, curY);
    }
  }

  preventClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
  }

  element.addEventListener("pointerdown", dragPointerDown);
}

// See: https://www.w3schools.com/howto/howto_js_draggable.asp
export function makeDraggable(elmnt) {
  if (!elmnt) {
    console.warn("makeDraggable: No element!");
    return;
  }
  let draggableElem = elmnt;
  // if present, the header is where you move the DIV from:
  let header = elmnt.querySelector(".EditorPaneHeader");
  if (header !== null) {
    draggableElem = header;
  }
  var lastX = 0;
  var lastY = 0;
  makeDraggableExt(draggableElem, {
    onStart: (startX, startY) => {
      lastX = startX;
      lastY = startY;
    },
    onUpdate: (startX, startY, curX, curY) => {
      // set the element's new position:
      let deltaX = curX - lastX;
      let deltaY = curY - lastY;
      lastX = curX;
      lastY = curY;
      elmnt.style.top = (elmnt.offsetTop + deltaY) + "px";
      elmnt.style.left = (elmnt.offsetLeft + deltaX) + "px"; }
  });
}

export function setupWidgetDrag(widgetElem, node) {
  if (!widgetElem) {
    console.warn("setupWidgetDrag: No widgetElem!");
    return;
  }
  var dragObj = {
    selectedNodes: null,
    originalPositions: null,
  };
  makeDraggableExt(widgetElem, {
    allowDrag: () => {
      //return !node.interaction;
      // Note - we want the node to be selected first so that we can do drag-to-create
      return node.isSelected() && !node.interaction;
    },
    onStart: (startX, startY) => {
      node.interaction = 'move';
      // Get all selected nodes that can be moved (non-root)
      const allSelectedNodes = gApp.site.getSelectedItems().filter(n => !n.isRoot());
      // Get only the toplevel nodes to avoid moving children multiple times
      dragObj.selectedNodes = Node.getToplevelNodes(allSelectedNodes);
      // Store original positions for all toplevel movable selected nodes
      dragObj.originalPositions = dragObj.selectedNodes.map(n => ({
        node: n,
        origPosX: n.posX,
        origPosY: n.posY
      }));
    },
    onUpdate: (startX, startY, curX, curY) => {
      let diffX = curX - startX;
      let diffY = curY - startY;
      // Update positions for all toplevel movable selected nodes
      for (const posData of dragObj.originalPositions) {
        posData.node.posX = posData.origPosX + diffX;
        posData.node.posY = posData.origPosY + diffY;
      }
    },
    onEnd: () => {
      node.interaction = null;
    }
  })
}

