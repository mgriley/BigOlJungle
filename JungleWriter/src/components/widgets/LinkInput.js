export const LinkType = {
  External: 'External',
  Download: 'Download'
};

export class LinkInput {
  constructor(type = LinkType.External, url = '') {
    this.type = type;
    this.url = url;
  }

  writeToJson() {
    return {
      type: this.type,
      url: this.url,
    };
  }

  readFromJson(obj) {
    // Handle legacy case where obj is a string URL
    if (typeof obj === 'string') {
      this.type = LinkType.External;
      this.url = obj || '';
    } else {
      this.type = obj.type || LinkType.External;
      this.url = obj.url || '';
    }
  }

  hasLink() {
    return this.url.trim() !== '';
  }

  getLinkUrl() {
    if (!this.hasLink()) {
      return '';
    }
    return this.url;
  }

  setLink(type, url) {
    this.type = type;
    this.url = url || '';
  }

  clearLink() {
    this.type = LinkType.External;
    this.url = '';
  }

  getHref() {
    if (!this.hasLink()) {
      return '';
    }
    
    if (this.type === LinkType.External) {
      let url = this.url;
      // Add protocol if missing
      if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      return url;
    } else if (this.type === LinkType.Download) {
      return this.url;
    }
    
    return '';
  }

  getTarget() {
    if (this.type === LinkType.External) {
      return '_blank';
    }
    return '';
  }

  getDownload() {
    if (this.type === LinkType.Download) {
      return this.url;
    }
    return null;
  }

  getLinkAttributes(isEditing = false) {
    let obj = {
      href: this.getHref(),
      target: this.getTarget(),
      download: this.getDownload(),
    };
    return obj;
  }
}
