import { ref, reactive } from 'vue'

export class AutosaveTimer {
  constructor(intervalSecs, saveFunc) {
    this.intervalSecs = intervalSecs;
    this.saveFunc = saveFunc;
    this.timer = null;
    this.appStartTime = new Date();
  }

  onEnterForeground() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.timer = setInterval(() => {
      if (document.visibilityState == 'visible') {
        let curAppTime = Math.round(this.getAppTimeSecs());
        console.log(`Autosaving... (${curAppTime}s)`);
        this.saveFunc();
      }
    }, this.intervalSecs * 1000);
  }

  onEnterBackground() {
    clearInterval(this.timer);
    this.timer = null;
  }

  getAppTimeSecs() {
    let curTime = new Date();
    return (curTime - this.appStartTime) / 1000.0;
  }
}

