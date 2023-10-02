import * as State from '../State.js'

export class TextNode extends State.Node {
  static sUiShortName = "T";

  constructor() {
    super();
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
