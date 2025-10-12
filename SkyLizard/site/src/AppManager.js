import { reactive } from "vue";

export class DownloadInfo {
  constructor() {
    this.url = "";
  }
}

export class AppInfo {
  constructor() {
    this.idString = "TODO";
  }

  static create(...args) {
    return reactive(new AppInfo(...args));
  }
}

/**
 * Manages app stuff
 */
export class AppManager {
  constructor() {
    this.runningApps = reactive([]);
  }

  async getMyApps() {
    // TODO
  }

  async addApp(appInfo) {
    // TODO
  }

  async changeAppId(appId, newId) {
    // TODO
  }

  async deleteApp(appId) {
  }

  async stopApp(appId) {
  }

  async startApp(appId) {
  }

  async exportApp(appId) {
    // TODO
  }

  async importApp(appData) {
    // TODO
  }

  async checkAppUpdates(appId) {
    // TODO
  }
async updateApp(appId) {
    // TODO
  }
}