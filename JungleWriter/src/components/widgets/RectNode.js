import { reactive, ref, watchEffect, watch, nextTick } from 'vue'
import { gApp, } from '../State.js'
import { Node } from '../Node.js'
import { extendMap } from '../Utils.js'
import { BackgroundInfo } from './BackgroundInfo.js'
import { BorderInfo } from './BorderInfo.js'
import { FilterInfo } from './FilterInfo.js'
import { createElementString } from '../StaticSiteTemplates.js'

let kRectNodeCss = `.RectWidget {
  background-color: lightblue;
}`;

export class RectNode extends Node {
  static sUiShortName = "R";

  constructor(id) {
    super(id);
    this.name = "Rect";
    this.type = "RectNode";
    this.allowsChildren = false;

    // Default size and position
    this.width = 200;
    this.height = 200;
    this.posX = -100;
    this.posY = -100;

    this.background = new BackgroundInfo();
    this.background.color.setColorValue('rgba(0, 0, 255, 1.0)');
    this.border = new BorderInfo();
    //this.filter = new FilterInfo();
    //this.backdropFilter = new FilterInfo();
  }

  writeToJson() {
    let obj = super.writeToJson();
    extendMap(obj, {
      width: this.width,
      height: this.height,
      background: this.background.writeToJson(),
      border: this.border.writeToJson(),
      //filter: this.filter.writeToJson(),
      //backdropFilter: this.backdropFilter.writeToJson(),
    });
    return obj;
  }

  readFromJson(obj) {
    super.readFromJson(obj);
    this.width = obj.width;
    this.height = obj.height;
    this.background.readFromJson(obj.background);
    this.border.readFromJson(obj.border);
    /*
    if ('filter' in obj) {
      this.filter.readFromJson(obj.filter);
    }
    */
    /*
    if ('backdropFilter' in obj) {
      this.backdropFilter.readFromJson(obj.backdropFilter);
    }
    */
  }

  getStyleObject() {
    let parentStyle = super.getStyleObject();
    let myStyle = {
      width: `${this.width}px`,
      height: `${this.height}px`,
      ...this.background.getStyleObject(),
      ...this.border.getStyleObject(),
      //...this.filter.getStyleObject('filter'),
      //...this.backdropFilter.getStyleObject('backdrop-filter'),
    };
    return {
      ...parentStyle,
      ...myStyle
    };
  }

  async generateStaticHtml(writer) {
    let htmlString = createElementString(
      'div', {class: "Widget RectWidget"}, this.getStyleObject());
    return htmlString;
  }
};

