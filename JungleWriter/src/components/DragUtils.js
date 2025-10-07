import { gApp } from './State.js'

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

  let dragMouseDown = null;
  let elementDrag = null;
  let closeDragElement = null;

  dragMouseDown = (e) => {
    e = e || window.event;
    e.preventDefault();
    e.stopPropagation();

    let allowDrag = true;
    if (dragFuncs.allowDrag) {
      allowDrag = dragFuncs.allowDrag();
    }

    if (allowDrag) {
      startX = e.clientX;
      startY = e.clientY;
      curX = startX;
      curY = startY;
      constraintDirection = null; // Reset constraint direction
      document.addEventListener("mouseup", closeDragElement);
      document.addEventListener("mousemove", elementDrag);
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
    
    // If shift is pressed, constrain movement to horizontal or vertical
    if (e.shiftKey) {
      let deltaX = Math.abs(newX - startX);
      let deltaY = Math.abs(newY - startY);
      
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

  closeDragElement = () => {
    document.removeEventListener("mouseup", closeDragElement);
    document.removeEventListener("mousemove", elementDrag);
    if (dragFuncs.onEnd) {
      dragFuncs.onEnd(startX, startY, curX, curY);
    }
  }

  element.addEventListener("mousedown", dragMouseDown);
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

// Returns an opaque `listener` object that you can
// removeHoverListener with when want to remove.
export function addHoverListener(elem, hoverFuncs) {
  if (!elem) {
    console.warn("addHoverListener: No element!");
    return;
  }
  let onHoverStart = (evt) => {
    if (hoverFuncs.onStart) {
      hoverFuncs.onStart(evt);
    }
  };
  let onHoverEnd = (evt) => {
    if (hoverFuncs.onEnd) {
      hoverFuncs.onEnd(evt);
    }
  };
  elem.addEventListener("mouseover", onHoverStart);
  elem.addEventListener("mouseout", onHoverEnd);
  return {onStart: onHoverStart, onEnd: onHoverEnd};
}

export function removeHoverListener(elem, listenerObj) {
  if (!elem) {
    console.warn("removeHoverListener: No element!");
    return;
  }
  elem.removeEventListener("mouseover", listenerObj.onStart);
  elem.removeEventListener("mouseout", listenerObj.onEnd);
}

export function setupWidgetDrag(widgetElem, node) {
  if (!widgetElem) {
    console.warn("setupWidgetDrag: No widgetElem!");
    return;
  }
  var dragObj = {
    origPosX: null,
    origPosY: null,
  };
  makeDraggableExt(widgetElem, {
    allowDrag: () => {
      //return !node.interaction;
      // Note - we want the node to be selected first so that we can do drag-to-create
      return node.isSelected() && !node.interaction;
    },
    onStart: (startX, startY) => {
      node.interaction = 'move';
      dragObj.origPosX = node.posX;
      dragObj.origPosY = node.posY;
    },
    onUpdate: (startX, startY, curX, curY) => {
      let diffX = curX - startX;
      let diffY = curY - startY;
      node.posX = dragObj.origPosX + diffX;
      node.posY = dragObj.origPosY + diffY;
    },
    onEnd: () => {
      node.interaction = null;
    }
  })
}

