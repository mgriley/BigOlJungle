
export class EditorPaneSettings {
  constructor() {
    this.isCollapsed = false;
    this.posX = '0px';
    this.posY = '0px';
  }
  
  writeToJson() {
    return {
      isCollapsed: this.isCollapsed,
      posX: this.posX,
      posY: this.posY,
    }
  }

  readFromJson(obj) {
    this.isCollapsed = obj.isCollapsed;
    this.posX = obj.posX;
    this.posY = obj.posY;
  }
}

