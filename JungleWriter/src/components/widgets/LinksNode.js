import * as State from '../State.js'
import { Node } from '../Node.js'
import { extendMap } from '../Utils.js'

export class LinksNode extends Node {
  static sUiShortName = "L";

  constructor(generateId) {
    super(generateId);
    this.name = "Links";
    this.type = "LinksNode";
    this.allowsChildren = false;

    this.fontFamily = null;
    this.fontSize = 36;
    this.color = "var(--darkest-color)";
    this.bold = false;
    this.italic = false;
    this.underline = false;
    this.lineHeight = null;
    this.textAlign = 'left';
  }

  writeToJson() {
    let obj = super.writeToJson();
    extendMap(obj, {
      text: this.text,
      fontFamily: this.fontFamily,
      fontSize: this.fontSize,
      color: this.color,
      bold: this.bold,
      italic: this.italic,
      underline: this.underline,
      lineHeight: this.lineHeight,
      textAlign: this.textAlign,
    });
    return obj;
  }

  readFromJson(obj) {
    super.readFromJson(obj);
    this.text = obj.text;
    this.fontFamily = obj.fontFamily;
    this.fontSize = obj.fontSize;
    this.color = obj.color;
    this.bold = obj.bold;
    this.italic = obj.italic;
    this.underline = obj.underline;
    this.lineHeight = obj.lineHeight;
    this.textAlign = obj.textAlign;
  }

  getStyleObject() {
    let parentStyle = super.getStyleObject();
    let myStyle = {
      fontSize: this.fontSize + 'px',
      textAlign: this.textAlign,
    };
    if (this.fontFamily) {
      myStyle.fontFamily = this.fontFamily;
    }
    if (this.color) {
      myStyle.color = this.color;
    }
    if (this.bold) {
      myStyle.fontWeight = "bold";
    }
    if (this.italic) {
      myStyle.fontStyle = "italic";
    }
    if (this.underline) {
      myStyle.textDecoration = "underline";
    }
    if (this.lineHeight !== null) {
      myStyle.lineHeight = this.lineHeight;
    }
    return {
      ...parentStyle,
      ...myStyle
    };
  }

  async generateStaticHtml(writer) {
    return `<p>Not yet implemented</p>`;
  }
};
