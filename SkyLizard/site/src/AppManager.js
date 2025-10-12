import { reactive } from "vue";
import { AppInfo, SourceInfo } from "../../shared/Shared.js";

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

  async getAppLogs(appId) {
    // TODO
  }
}