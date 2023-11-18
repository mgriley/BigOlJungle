import './assets/main.css'

import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import VueFeather from 'vue-feather';
import App from './App.vue'
import { initGlobalApp } from './components/editor/State.js'
import { registerNodeTypes } from './components/editor/widgets/RegisterNodes.js'

import HomeEditor from './components/editor/HomeEditor.vue'
import FeedEditor from './components/editor/FeedEditor.vue'
import FilesPageEditor from './components/editor/FilesPageEditor.vue'

async function loadApp() {
  const routes = [
    {
      path: '/', name: 'home', component: HomeEditor,
    },
    {
      path: '/feed', name: 'feed', component: FeedEditor,
    },
    {
      path: '/files', name: 'files', component: FilesPageEditor
    }
  ]

  const router = createRouter({
    history: createWebHashHistory(),
    routes: routes,
  });

  const app = createApp(App)
  app.use(router);
  app.component(VueFeather.name, VueFeather)

  await initGlobalApp(app.config.globalProperties.$router)
  registerNodeTypes();

  app.mount('#app')
}

loadApp();

