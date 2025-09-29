import JSZip from 'jszip'

import baseCss from '../assets/base.css?raw'
import utilsCss from '../assets/utils.css?raw'
import buttonsCss from '../assets/buttons.css?raw'
import writerCss from '../assets/writer.css?raw'
import mainCss from '../assets/main.css?raw'

/**
 * Writer for the static site export format.
 * 
 * Allows writing a static site to a zip file
 */
export class StaticSiteWriter {
  constructor(site, siteName = 'site') {
    this.site = site;
    this.zip = new JSZip();
    this.cssBlocks = new Map();
    this.siteName = siteName;
    this.addedFiles = new Set();

    this._addDefaultCss();
  }

  _removeImportLines(cssString) {
    return cssString
      .split('\n')
      .filter(line => !line.trim().startsWith('@import'))
      .join('\n');
  }

  _addDefaultCss() {
    /**
     * We add the default styles used in the editor to the site so that
     * what we see in the site matches the editor.
     */
    this.addStyleBlock('base', this._removeImportLines(baseCss));
    this.addStyleBlock('utils', this._removeImportLines(utilsCss));
    this.addStyleBlock('buttons', this._removeImportLines(buttonsCss));
    this.addStyleBlock('writer', this._removeImportLines(writerCss));
    this.addStyleBlock('main', this._removeImportLines(mainCss));
  }

  addTextFile(path, content) {
    if (!this.addedFiles.has(path)) {
      this.zip.file(`${this.siteName}/${path}`, content);
      this.addedFiles.add(path);
    }
  }

  addBlobFile(path, blob) {
    if (!this.addedFiles.has(path)) {
      this.zip.file(`${this.siteName}/${path}`, blob);
      console.log(`Added blob file at path: ${this.siteName}/${path}`);
      this.addedFiles.add(path);
    }
  }

  async addFileWithName(path, targetPath=null) {
    if (!path) {
      return;
    }
    console.log(`Adding file ${path} => ${targetPath || path}`);
    let fileObj = await this.site.siteDir.findChild(path);
    if (fileObj && fileObj.isFile()) {
      let file = await fileObj.getFile();
      let finalPath = targetPath || path;
      this.addBlobFile(finalPath, file);
    }
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
