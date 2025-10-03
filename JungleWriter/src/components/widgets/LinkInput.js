export const LinkType = {
  none: 'None',
  external: 'External',
  download: 'Download'
};

export class LinkInput {
  constructor(type = LinkType.none, url = '') {
    this.type = type; // LinkType.none, LinkType.external, or LinkType.download
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
      this.type = obj ? LinkType.external : LinkType.none;
      this.url = obj || '';
    } else {
      this.type = obj.type || LinkType.none;
      this.url = obj.url || '';
    }
  }

  hasLink() {
    return this.type !== LinkType.none && this.url.trim() !== '';
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
