export const LinkType = {
  NONE: 'None',
  EXTERNAL: 'External',
  DOWNLOAD: 'Download'
};

export class LinkInput {
  constructor(type = LinkType.NONE, url = '') {
    this.type = type; // LinkType.NONE, LinkType.EXTERNAL, or LinkType.DOWNLOAD
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
      this.type = obj ? LinkType.EXTERNAL : LinkType.NONE;
      this.url = obj || '';
    } else {
      this.type = obj.type || LinkType.NONE;
      this.url = obj.url || '';
    }
  }

  hasLink() {
    return this.type !== LinkType.NONE && this.url.trim() !== '';
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
    this.type = LinkType.NONE;
    this.url = '';
  }
}
