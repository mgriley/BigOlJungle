export class LinkInput {
  constructor(type = 'None', url = '') {
    this.type = type; // 'None', 'External', or 'Download'
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
      this.type = obj ? 'External' : 'None';
      this.url = obj || '';
    } else {
      this.type = obj.type || 'None';
      this.url = obj.url || '';
    }
  }

  hasLink() {
    return this.type !== 'None' && this.url.trim() !== '';
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
    this.type = 'None';
    this.url = '';
  }
}
