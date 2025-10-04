export const LinkType = {
  None: 'None',
  External: 'External',
  Download: 'Download'
};

export class LinkInput {
  constructor(type = LinkType.None, url = '') {
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
      this.type = obj ? LinkType.External : LinkType.none;
      this.url = obj || '';
    } else {
      this.type = obj.type || LinkType.None;
      this.url = obj.url || '';
    }
  }

  hasLink() {
    return this.type !== LinkType.None && this.url.trim() !== '';
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
    this.type = LinkType.none;
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
}
