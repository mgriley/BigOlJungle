import * as State from '../State.js'
import { gApp } from '../Globals.js'
import { Node } from '../Node.js'
import { extendMap } from '../Utils.js'
import { trimText } from 'Shared/SharedUtils.js'
import { createElementString, escapeHtml } from '../StaticSiteTemplates.js';
import { ColorInput } from './ColorInput.js';
import { LinkInput } from './LinkInput.js';

export class LinkNode extends Node {
  static sUiShortName = "L";

  constructor(id) {
    super(id);
    this.name = "Link";
    this.type = "LinkNode";

    this.text = "";
    this.fontFamily = "sans-serif";
    this.fontSize = 36;
    this.color = new ColorInput('#0000ff', 1.0);
    this.bold = false;
    this.italic = false;
    this.underline = true;
    this.width = 250;

    this.link = new LinkInput();
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
      width: this.width,
      link: this.link.writeToJson(),
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
    let clone = gApp.site.createNode(LinkNode);
    clone.name = this.name;
    clone.posX = this.posX;
    clone.posY = this.posY;
    clone.text = this.text;
    clone.fontFamily = this.fontFamily;
    clone.fontSize = this.fontSize;
    
    // Clone color
    clone.color = new ColorInput();
    clone.color.readFromJson(this.color.writeToJson());
    
    clone.bold = this.bold;
    clone.italic = this.italic;
    clone.underline = this.underline;
    clone.width = this.width;
    
    // Clone link
    clone.link = new LinkInput();
    clone.link.readFromJson(this.link.writeToJson());
    
    return clone;
  }

  async generateStaticHtml(writer) {
    // We make a div tag and put a link <a> inside it
    // Reason for the outer div is to match editor side, where we use an outer div to simplify
    // some of the editing logic.
    
    // Wrap content in link if link is present
    const linkAttrs = this.link.getLinkAttributes();
    let content = createElementString('a', {class: 'TextLink', ...linkAttrs}, {}, escapeHtml(this.text));
    if (this.link.type === 'Download') {
      await writer.addFileWithName(this.link.url);
    }
    let classes = "Widget";
    if (this.elementClasses) {
      classes += " " + this.elementClasses;
    }
    return createElementString(
      this.elementType, {id: this.getElementId(), class: classes}, this.getStyleObject(),
      content
    );
  }
};
