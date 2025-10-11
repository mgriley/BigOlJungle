// Web Worker for Safari file writing using createSyncAccessHandle
// This is necessary because Safari does not support the async createWritable()
// method on the main thread. It only supports synchronous file access through
// a web worker.
self.onmessage = async function(e) {
  const { id, filePath, data } = e.data;
  
  try {
    // Get the root directory handle
    const rootHandle = await navigator.storage.getDirectory();
    
    // Navigate to the file using the path
    const pathParts = filePath.split('/');
    let currentHandle = rootHandle;
    
    // Navigate through directories
    for (let i = 0; i < pathParts.length - 1; i++) {
      currentHandle = await currentHandle.getDirectoryHandle(pathParts[i]);
    }
    
    // Get the file handle
    const fileName = pathParts[pathParts.length - 1];
    const fileHandle = await currentHandle.getFileHandle(fileName);
    
    if (!fileHandle.createSyncAccessHandle) {
      throw new Error('createSyncAccessHandle not supported');
    }
    
    const accessHandle = await fileHandle.createSyncAccessHandle();
    
    try {
      // Convert data to appropriate format if needed
      let buffer;
      if (typeof data === 'string') {
        buffer = new TextEncoder().encode(data);
      } else if (data instanceof ArrayBuffer) {
        buffer = new Uint8Array(data);
      } else {
        // Assume it's already a Uint8Array or similar
        buffer = data;
      }
      
      accessHandle.truncate(0); // Clear file first
      accessHandle.write(buffer, { at: 0 });
      accessHandle.flush();
      
      self.postMessage({ id, success: true });
    } finally {
      accessHandle.close();
    }
  } catch (error) {
    self.postMessage({ 
      id, 
      success: false, 
      error: error.message 
    });
  }
};
