import JSZip from 'jszip'

/**
 * Writer for the static site export format.
 * 
 * Allows writing a static site to a zip file
 */
export class StaticSiteWriter {
  constructor() {
    this.zip = new JSZip();
    this.cssBlocks = new Map();
  }

  addTextFile(path, content) {
    this.zip.file(path, content);
  }

  addBlobFile(path, blob) {
    this.zip.file(path, blob);
  }

  addStyleBlock(key, cssString) {
    if (!this.cssBlocks.has(key)) {
      this.cssBlocks.set(key, cssString);
    }
  }

  async finalize() {
    // Add the combined CSS file if there are any style blocks
    if (this.cssBlocks.size > 0) {
      const combinedCSS = Array.from(this.cssBlocks.values()).join('\n\n');
      this.addTextFile('styles.css', combinedCSS);
    }
    
    return await this.zip.generateAsync({type: 'blob'});
  }
}
