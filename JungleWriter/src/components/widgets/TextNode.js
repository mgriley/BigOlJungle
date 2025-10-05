import * as State from '../State.js'
import { gApp } from '../Globals.js'
import { Node } from '../Node.js'
import { extendMap } from '../Utils.js'
import { trimText } from 'Shared/SharedUtils.js'
import { createElementString } from '../StaticSiteTemplates.js';
import { ColorInput } from './ColorInput.js';
import { LinkInput } from './LinkInput.js';

export const ElementType = {
  Paragraph: 'p',
  Heading1: 'h1',
  Heading2: 'h2',
  Heading3: 'h3'
};

export class TextNode extends Node {
  static sUiShortName = "T";

  constructor(id) {
    super(id);
    this.name = "Text";
    this.type = "TextNode";

    this.text = "";
    this.elementType = ElementType.Paragraph;
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

    this.link = new LinkInput();
  }

  writeToJson() {
    let obj = super.writeToJson();
    extendMap(obj, {
      text: this.text,
      elementType: this.elementType,
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
      link: this.link.writeToJson(),
    });
    return obj;
  }

  readFromJson(obj) {
    super.readFromJson(obj);
    this.text = obj.text;
    this.elementType = obj.elementType || ElementType.Paragraph;
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
    if (obj.link) {
      this.link.readFromJson(obj.link);
    }
  }

  onCreate() {
  }

  applyPreferences(prefs) {
    if (prefs.fontFamily) {
      this.fontFamily = prefs.fontFamily;
    }
    if (prefs.fontSize) {
      this.fontSize = prefs.fontSize;
    }
    if (prefs.textColor) {
      this.color = prefs.textColor.clone();
    }  
  }

  getAllowsChildren() {
    return false;
  }

  getAutomaticName() {
    let trimmed = trimText(this.text, 12);
    if (trimmed) {
      return trimmed;
    }
    return "(Empty)";
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

  _cloneSelf() {
    if (!this.parentNode) {
      throw new Error("Cannot clone the Root node");
    }
    let clone = gApp.site.createNode(TextNode);
    clone.name = this.name;
    clone.posX = this.posX;
    clone.posY = this.posY;
    clone.text = this.text;
    clone.elementType = this.elementType;
    clone.fontFamily = this.fontFamily;
    clone.fontSize = this.fontSize;
    
    // Clone color
    clone.color = new ColorInput();
    clone.color.readFromJson(this.color.writeToJson());
    
    clone.bold = this.bold;
    clone.italic = this.italic;
    clone.underline = this.underline;
    clone.lineHeight = this.lineHeight;
    clone.letterSpacing = this.letterSpacing;
    clone.textAlign = this.textAlign;
    clone.width = this.width;
    
    // Clone link
    clone.link = new LinkInput();
    clone.link.readFromJson(this.link.writeToJson());
    
    return clone;
  }

  async generateStaticHtml(writer) {
    let content = this.text;
    
    // Wrap content in link if link is present
    if (this.link.hasLink()) {
      const linkAttrs = this.link.getLinkAttributes();
      content = createElementString('a', linkAttrs, {}, content);

      if (this.link.type === 'Download') {
        await writer.addFileWithName(this.link.url);
      }
    }
    
    return createElementString(
      this.elementType, {class: "Widget TextWidget"}, this.getStyleObject(),
      content
    );
  }
};
