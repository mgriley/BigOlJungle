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
  var startX = null;
  var startY = null;
  var curX = null;
  var curY = null;

  let dragMouseDown = null;
  let elementDrag = null;
  let closeDragElement = null;

  dragMouseDown = (e) => {
    e = e || window.event;
    e.preventDefault();

    let allowDrag = true;
    if (dragFuncs.allowDrag) {
      allowDrag = dragFuncs.allowDrag();
    }

    if (allowDrag) {
      startX = e.clientX;
      startY = e.clientY;
      curX = startX;
      curY = startY;
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
    curX = e.clientX;
    curY = e.clientY;
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
      elmnt.style.left = (elmnt.offsetLeft + deltaX) + "px";
    }
  });
}

// Returns an opaque `listener` object that you can
// removeHoverListener with when want to remove.
export function addHoverListener(elem, hoverFuncs) {
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
  elem.removeEventListener("mouseover", listenerObj.onStart);
  elem.removeEventListener("mouseout", listenerObj.onEnd);
}

export function setupWidget(widgetElem, node) {
  var dragObj = {
    origPosX: null,
    origPosY: null,
  };
  makeDraggableExt(widgetElem, {
    allowDrag: () => {
      return node.isSelected();
    },
    onStart: (startX, startY) => {
      dragObj.origPosX = node.posX;
      dragObj.origPosY = node.posY;
    },
    onUpdate: (startX, startY, curX, curY) => {
      let diffX = curX - startX;
      let diffY = curY - startY;
      node.posX = dragObj.origPosX + diffX;
      node.posY = dragObj.origPosY + diffY;
    },
  })
}

