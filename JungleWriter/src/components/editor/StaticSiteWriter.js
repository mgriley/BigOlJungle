import JSZip from 'jszip'

import baseCss from '../../assets/base.css?raw'
import utilsCss from '../../assets/utils.css?raw'
import buttonsCss from '../../assets/buttons.css?raw'
import writerCss from '../../assets/writer.css?raw'
import mainCss from '../../assets/main.css?raw'

/**
 * Writer for the static site export format.
 * 
 * Allows writing a static site to a zip file
 */
export class StaticSiteWriter {
  constructor() {
    this.zip = new JSZip();
    this.cssBlocks = new Map();

    this._addDefaultCss();
  }

  _addDefaultCss() {
    /**
     * We add the default styles used in the editor to the site so that
     * what we see in the site matches the editor.
     */
    this.addStyleBlock('base', baseCss);
    this.addStyleBlock('utils', utilsCss);
    this.addStyleBlock('buttons', buttonsCss);
    this.addStyleBlock('writer', writerCss);
    this.addStyleBlock('main', mainCss);
  }

  addTextFile(path, content) {
    this.zip.file(path, content);
  }

  addBlobFile(path, blob) {
    this.zip.file(path, blob);
  }

  addStyleBlock(key, cssString) {
    if (!this.cssBlocks.has(key)) {
      let styleBlockString = `/* STYLE BLOCK - ${key} */\n\n` + cssString;
      this.cssBlocks.set(key, styleBlockString);
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
