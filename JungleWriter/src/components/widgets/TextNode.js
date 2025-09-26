import * as State from '../State.js'
import { Node } from '../Node.js'
import { extendMap } from '../Utils.js'
import { createElementString } from '../StaticSiteTemplates.js';
import { ColorInput } from './ColorInput.js';

export class TextNode extends Node {
  static sUiShortName = "T";

  constructor(generateId) {
    super(generateId);
    this.name = "Text";
    this.type = "TextNode";
    this.allowsChildren = false;

    this.text = "Text";
    this.fontFamily = "sans-serif";
    this.fontSize = 36;
    this.color = new ColorInput('#000000', 1.0);
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
      color: this.color.writeToJson(),
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

  async generateStaticHtml(writer) {
    return createElementString(
      'div', {class: "Widget TextWidget"}, this.getStyleObject(),
       this.text
    );
  }
};
