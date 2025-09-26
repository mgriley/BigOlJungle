import { ColorInput } from './ColorInput.js'

export class BorderInfo {
  constructor() {
    this.enabled = false;
    this.width = 2;
    this.style = 'none';
    this.color = new ColorInput('#000000', 1.0);
    this.radius = 0;
  }

  writeToJson() {
    return {
      enabled: this.enabled,
      width: this.width,
      style: this.style,
      color: this.color.writeToJson(),
      radius: this.radius,
    }
  }

  readFromJson(obj) {
    this.enabled = obj.enabled || false;
    this.width = obj.width;
    this.style = obj.style;
    if (obj && obj.color) {
      this.color.readFromJson(obj.color);
    } else {
      this.color = new ColorInput('#000000', 1.0);
    }
    this.radius = obj.radius;
  }

  getStyleObject() {
    if (!this.enabled) {
      return {};
    }
    return {
      'border': `${this.width}px ${this.style} ${this.color.getColorValue()}`,
      'border-radius': `${this.radius}px`,
    }
  }
};

