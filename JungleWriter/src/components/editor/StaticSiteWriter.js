import JSZip from 'jszip'

/**
 * Writer for the static site export format.
 * 
 * Allows writing a static site to a zip file
 */
export class StaticSiteWriter {
  constructor() {
    this.zip = new JSZip();
  }

  addTextFile(path, content) {
    this.zip.file(path, content);
  }

  addBlobFile(path, blob) {
    this.zip.file(path, blob);
  }

  async finalize() {
    return await this.zip.generateAsync({type: 'blob'});
  }
}
