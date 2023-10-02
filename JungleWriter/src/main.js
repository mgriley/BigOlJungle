import './assets/main.css'

import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import VueFeather from 'vue-feather';
import App from './App.vue'
import { initGlobalApp } from './components/editor/State.js'
import { registerNodeTypes } from './components/editor/widgets/RegisterNodes.js'

const app = createApp(App)
app.component(VueFeather.name, VueFeather)

/*
initGlobalReader(app.config.globalProperties.$toast,
  app.config.globalProperties.$router)
*/
initGlobalApp()
registerNodeTypes();

app.mount('#app')
