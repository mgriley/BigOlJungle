const { AppInfo } = require('../../shared/Shared.js');


class ServerState {
  constructor() {
    this.apps = [];
  }

  writeToJson() {
  }

  readFromJson(obj) {
  }

  async writeToDisk() {
  }

  async readFromDisk() {
  }

  async loadApps() {
    // TODO
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

export { ServerState };