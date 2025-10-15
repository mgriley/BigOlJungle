import * as State from '../State.js'
import { gApp } from '../Globals.js'
import { Node } from '../Node.js'
import { extendMap } from '../Utils.js'
import { trimText } from 'Shared/SharedUtils.js'
import { createElementString, escapeHtml } from '../StaticSiteTemplates.js';
import { ColorInput } from './ColorInput.js';
import { LinkInput } from './LinkInput.js';
import { TextStyle } from './TextStyle.js';

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
    this.textStyle = new TextStyle();
    this.textStyle.underline = true; // Links are underlined by default
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
      textStyle: this.textStyle.writeToJson(),
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
    
    // Support both new textStyle format and legacy individual fields
    if (obj.textStyle) {
      this.textStyle.readFromJson(obj.textStyle);
    } else {
      // Legacy support: read individual bold/italic/underline fields
      this.textStyle.bold = obj.bold || false;
      this.textStyle.italic = obj.italic || false;
      this.textStyle.underline = obj.underline !== undefined ? obj.underline : true;
    }
    
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
    this.textStyle.applyToStyleObject(myStyle);
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
    
    // Clone text style
    clone.textStyle = this.textStyle.clone();
    
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
