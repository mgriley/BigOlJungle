export class ColorInput {
  constructor(color = '#ffffff', alpha = 1.0) {
    this.color = color;
    this.alpha = alpha;
  }

  writeToJson() {
    return {
      color: this.color,
      alpha: this.alpha,
    };
  }

  readFromJson(obj) {
    this.color = obj.color || '#ffffff';
    this.alpha = obj.alpha !== undefined ? obj.alpha : 1.0;
  }

  getColorValue() {
    // Convert hex to RGB
    const r = parseInt(this.color.slice(1, 3), 16);
    const g = parseInt(this.color.slice(3, 5), 16);
    const b = parseInt(this.color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${this.alpha})`;
  }
}
