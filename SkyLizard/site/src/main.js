import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { setGlobalApp } from './Globals.js'
import { AppManager } from './AppManager.js';

// Setup the JS state
let appMgr = new AppManager();
setGlobalApp(appMgr);

createApp(App).mount('#app')
