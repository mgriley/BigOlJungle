export class TextStyle {
  constructor() {
    this.bold = false;
    this.italic = false;
    this.underline = false;
  }

  writeToJson() {
    return {
      bold: this.bold,
      italic: this.italic,
      underline: this.underline,
    };
  }

  readFromJson(obj) {
    if (obj) {
      this.bold = obj.bold || false;
      this.italic = obj.italic || false;
      this.underline = obj.underline || false;
    }
  }

  clone() {
    const clone = new TextStyle();
    clone.bold = this.bold;
    clone.italic = this.italic;
    clone.underline = this.underline;
    return clone;
  }

  applyToStyleObject(styleObj) {
    if (this.bold) {
      styleObj.fontWeight = "bold";
    }
    if (this.italic) {
      styleObj.fontStyle = "italic";
    }
    if (this.underline) {
      styleObj.textDecoration = "underline";
    }
  }
}
