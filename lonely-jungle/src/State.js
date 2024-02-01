import { reactive, ref } from 'vue'

var gApp = null;

export class App {
  constructor() {
  }

  run() {
  }
}


export function initGlobalApp(toaster, router) {
  gApp = new App(toaster, router);
  gApp.run();
  return gApp;
}
