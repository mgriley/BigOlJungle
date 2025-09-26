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
    // Handle legacy case where obj is a hex string
    if (typeof obj === 'string') {
      this.color = obj;
      this.alpha = 1.0;
    } else {
      this.color = obj.color || '#ffffff';
      this.alpha = obj.alpha !== undefined ? obj.alpha : 1.0;
    }
  }

  getColorValue() {
    // Convert hex to RGB
    const r = parseInt(this.color.slice(1, 3), 16);
    const g = parseInt(this.color.slice(3, 5), 16);
    const b = parseInt(this.color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${this.alpha})`;
  }

  setColorValue(rgba) {
    // Expecting format: rgba(r, g, b, a)
    const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]*)\)/);
    if (match) {
      const r = parseInt(match[1]);
      const g = parseInt(match[2]);
      const b = parseInt(match[3]);
      const a = match[4] ? parseFloat(match[4]) : 1.0;
      this.color = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
      this.alpha = a;
    }
  }
}
