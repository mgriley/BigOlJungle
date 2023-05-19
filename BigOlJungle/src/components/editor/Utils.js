import { reactive, ref } from 'vue'

export function removeItem(arr, elem) {
  let index = arr.indexOf(elem);
  if (index == -1) {
    return false;
  }
  arr.splice(index, 1);
  return true;
}

// See: https://www.w3schools.com/howto/howto_js_draggable.asp
export function makeDraggable(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  let header = elmnt.querySelector(".EditorPaneHeader");
  if (header !== null) {
    // if present, the header is where you move the DIV from:
    header.onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

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
  element.onmousedown = dragMouseDown;

  var startX = null;
  var startY = null;
  var curX = null;
  var curY = null;

  function dragMouseDown(e) {
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
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
      if (dragFuncs.onStart) {
        dragFuncs.onStart(startX, startY);
      }
    }
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    curX = e.clientX;
    curY = e.clientY;
    if (dragFuncs.onUpdate) {
      dragFuncs.onUpdate(startX, startY, curX, curY);
    }
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
    if (dragFuncs.onEnd) {
      dragFuncs.onEnd(startX, startY, curX, curY);
    }
  }
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


