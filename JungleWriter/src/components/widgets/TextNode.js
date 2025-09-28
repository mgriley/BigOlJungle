import * as State from '../State.js'
import { Node } from '../Node.js'
import { extendMap } from '../Utils.js'
import { createElementString } from '../StaticSiteTemplates.js';
import { ColorInput } from './ColorInput.js';

export class TextNode extends Node {
  static sUiShortName = "T";

  constructor(id) {
    super(id);
    this.name = "Text";
    this.type = "TextNode";
    this.allowsChildren = false;

    this.text = "Double-click me 🐍";
    this.fontFamily = "sans-serif";
    this.fontSize = 36;
    this.color = new ColorInput('#000000', 1.0);
    this.bold = false;
    this.italic = false;
    this.underline = false;
    this.lineHeight = 1.2;
    this.letterSpacing = 0;
    this.textAlign = 'left';
    this.width = 350;

    this.linkUrl = "";
  }

  writeToJson() {
    let obj = super.writeToJson();
    extendMap(obj, {
      text: this.text,
      fontFamily: this.fontFamily,
      fontSize: this.fontSize,
      color: this.color.writeToJson(),
      bold: this.bold,
      italic: this.italic,
      underline: this.underline,
      lineHeight: this.lineHeight,
      letterSpacing: this.letterSpacing,
      textAlign: this.textAlign,
      width: this.width,
      linkUrl: this.linkUrl,
    });
    return obj;
  }

  readFromJson(obj) {
    super.readFromJson(obj);
    this.text = obj.text;
    if (obj.fontFamily) {
      this.fontFamily = obj.fontFamily;
    }
    this.fontSize = obj.fontSize;
    if (obj.color) {
      this.color.readFromJson(obj.color);
    } else {
      this.color = new ColorInput('#000000', 1.0);
    }
    this.bold = obj.bold;
    this.italic = obj.italic;
    this.underline = obj.underline;
    if (obj.lineHeight !== null) {
      this.lineHeight = obj.lineHeight;
    }
    this.letterSpacing = obj.letterSpacing || 0;
    this.textAlign = obj.textAlign;
    if (obj.width !== null) {
      this.width = Number(obj.width) || 200;
    }
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
      myStyle.color = this.color.getColorValue();
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
    myStyle.lineHeight = this.lineHeight;
    myStyle.letterSpacing = this.letterSpacing + 'px';
    myStyle.width = this.width + 'px';
    return {
      ...parentStyle,
      ...myStyle
    };
  }

  async generateStaticHtml(writer) {
    return createElementString(
      'div', {class: "Widget TextWidget"}, this.getStyleObject(),
       this.text
    );
  }
};
