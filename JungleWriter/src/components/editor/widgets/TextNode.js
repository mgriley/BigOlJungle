import * as State from '../State.js'
import { extendMap } from '../Utils.js'

export class TextNode extends State.Node {
  static sUiShortName = "T";

  constructor() {
    super();
    this.name = "Text";
    this.type = "TextNode";
    this.allowsChildren = false;

    this.text = "Hello World!";
    this.fontFamily = null;
    this.fontSize = 36;
    this.color = "var(--darkest-color)";
    this.bold = false;
    this.italic = false;
    this.underline = false;
    this.lineHeight = null;
    this.letterSpacing = null;
    this.textAlign = 'left';
    this.maxWidth = null;

    this.linkUrl = "";
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
      letterSpacing: this.letterSpacing,
      textAlign: this.textAlign,
      maxWidth: this.maxWidth,
      linkUrl: this.linkUrl,
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
    this.letterSpacing = obj.letterSpacing;
    this.textAlign = obj.textAlign;
    this.maxWidth = obj.maxWidth;
    this.linkUrl = obj.linkUrl;
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
    if (this.letterSpacing !== null) {
      myStyle.letterSpacing = this.letterSpacing + 'px';
    }
    if (this.maxWidth !== null) {
      myStyle.maxWidth = this.maxWidth + 'px';
      // TODO - not wrapping properly
      myStyle.overflowWrap = "normal";
    }
    return {
      ...parentStyle,
      ...myStyle
    };
  }
};
