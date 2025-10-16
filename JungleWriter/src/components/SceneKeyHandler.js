import { ref } from 'vue'
import { gApp } from './State.js'
import { Node } from './Node.js'

// Track which keys are currently pressed
const keysPressed = ref(new Set());
let scrollAnimationId = null;

function shouldIgnoreKeyEvent() {
  // Don't handle keys if cursor is in a text input
  const activeElement = document.activeElement;
  return activeElement && (
    activeElement.tagName === 'INPUT' || 
    activeElement.tagName === 'TEXTAREA' || 
    activeElement.contentEditable === 'true'
  );
}

function handleNodeDuplication(evt) {
  const selectedNodes = gApp.site.getSelectedItems();
  if (gApp.site.isEditing && selectedNodes.length > 0 && 
      (evt.ctrlKey || evt.metaKey) && evt.key.toLowerCase() === 'd') {
    
    // Filter out root nodes (can't be duplicated)
    const duplicatableNodes = selectedNodes.filter(node => !node.isRoot());
    
    if (duplicatableNodes.length > 0) {
      const clonedNodes = [];
      
      // Clone all selected nodes
      for (const node of duplicatableNodes) {
        const clonedNode = node.cloneAndAddAsSibling();
        clonedNodes.push(clonedNode);
      }
      
      // Select all the cloned nodes
      gApp.site.selectMany(clonedNodes);
      return true;
    }
  }
  return false;
}

function handleNodeDeletion(evt) {
  let selectedNodes = gApp.site.getSelectedItems();
  if (gApp.site.isEditing && selectedNodes.length > 0 && 
      (evt.key === 'Delete' || evt.key === 'Backspace')) {
    gApp.site.deleteSelectedNodes();
    return true;
  }
  return false;
}

function handleNodeResize(evt, selectedNodes) {
  const resizeAmount = 1; // pixels to resize per keypress
  let anyResized = false;
  
  for (const node of selectedNodes) {
    // Only resize if the node has width/height properties
    if (node.width !== undefined && node.height !== undefined) {
      switch (evt.key) {
        case 'ArrowLeft':
          // Shift left edge in (decrease width)
          node.width = Math.max(1, node.width - resizeAmount);
          anyResized = true;
          break;
        case 'ArrowRight':
          // Shift right edge out (increase width)
          node.width += resizeAmount;
          anyResized = true;
          break;
        case 'ArrowUp':
          // Shift top edge in (decrease height)
          node.height = Math.max(1, node.height - resizeAmount);
          anyResized = true;
          break;
        case 'ArrowDown':
          // Shift bottom edge out (increase height)
          node.height += resizeAmount;
          anyResized = true;
          break;
      }
    }
  }
  
  return anyResized;
}

function handleNodeMovement(evt, selectedNodes) {
  const moveAmount = 1; // pixels to move per keypress
  let delta = { deltaX: 0, deltaY: 0 };
  
  switch (evt.key) {
    case 'ArrowLeft':
      delta.deltaX = -moveAmount;
      break;
    case 'ArrowRight':
      delta.deltaX = moveAmount;
      break;
    case 'ArrowUp':
      delta.deltaY = -moveAmount;
      break;
    case 'ArrowDown':
      delta.deltaY = moveAmount;
      break;
    default:
      return false;
  }
  
  Node.moveNodes(selectedNodes, delta);
  return true;
}

function handleArrowKeys(evt) {
  const selectedNodes = gApp.site.getSelectedItems();
  
  // Only handle arrow keys when editing and nodes are selected
  if (!gApp.site.isEditing || selectedNodes.length === 0) {
    return false;
  }

  // Filter out root nodes (can't be moved/resized)
  const movableNodes = selectedNodes.filter(node => !node.isRoot());
  
  if (movableNodes.length === 0) {
    return false;
  }

  if (evt.shiftKey) {
    // Shift + arrow keys: resize the elements
    return handleNodeResize(evt, movableNodes);
  } else {
    // Regular arrow keys: move the elements
    return handleNodeMovement(evt, movableNodes);
  }
}

function handleWASDScrolling(evt) {
  const key = evt.key.toLowerCase();
  if (gApp.site.settings.enableWASDNavigation && ['w', 'a', 's', 'd'].includes(key)) {
    keysPressed.value.add(key);
    if (!scrollAnimationId) {
      startScrollAnimation();
    }
    return true;
  }
  return false;
}

function startScrollAnimation() {
  const scrollSpeed = 10; // pixels per frame
  
  function animate() {
    if (keysPressed.value.size === 0) {
      scrollAnimationId = null;
      return;
    }

    let offsetX = 0;
    let offsetY = 0;

    // Calculate movement based on pressed keys
    if (keysPressed.value.has('w')) offsetY -= 1;
    if (keysPressed.value.has('s')) offsetY += 1;
    if (keysPressed.value.has('a')) offsetX -= 1;
    if (keysPressed.value.has('d')) offsetX += 1;

    // Normalize diagonal movement
    if (offsetX !== 0 && offsetY !== 0) {
      const norm = Math.sqrt(2);
      offsetX /= norm;
      offsetY /= norm;
    }

    // Apply scrolling
    if (offsetX !== 0 || offsetY !== 0) {
      gApp.site.scrollMainBy(offsetX * scrollSpeed, offsetY * scrollSpeed);
    }

    scrollAnimationId = requestAnimationFrame(animate);
  }

  scrollAnimationId = requestAnimationFrame(animate);
}

function onKeyDown(evt) {
  /**
   * Use arrow keys to move selected node when in editing mode.
   * With shift held, use arrow keys to resize the selected node.
   * Use WASD keys to scroll the main element.
   */ 
  
  if (shouldIgnoreKeyEvent()) {
    return;
  }

  let handled = false;

  // Handle WASD keys for scrolling (if feature flag is enabled)
  if (!handled) {
    handled = handleWASDScrolling(evt);
  }

  // Handle Ctrl/Cmd+D for duplicating selected node
  if (!handled) {
    handled = handleNodeDuplication(evt);
  }

  // Handle Delete/Backspace for deleting selected node
  if (!handled) {
    handled = handleNodeDeletion(evt);
  }

  // Handle arrow keys for movement/resizing
  if (!handled) {
    handled = handleArrowKeys(evt);
  }

  if (handled) {
    evt.preventDefault();
    evt.stopPropagation();
  }
}

function onKeyUp(evt) {
  const key = evt.key.toLowerCase();
  if (gApp.site.settings.enableWASDNavigation && ['w', 'a', 's', 'd'].includes(key)) {
    keysPressed.value.delete(key);
    if (keysPressed.value.size === 0 && scrollAnimationId) {
      cancelAnimationFrame(scrollAnimationId);
      scrollAnimationId = null;
    }
  }
}

function cleanup() {
  // Clean up animation frame if still running
  if (scrollAnimationId) {
    cancelAnimationFrame(scrollAnimationId);
    scrollAnimationId = null;
  }
}

export {
  onKeyDown,
  onKeyUp,
  cleanup
}
