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
}
