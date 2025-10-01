import './assets/main.css'
import 'bootstrap-icons/font/bootstrap-icons.css';

import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import { initGlobalApp } from './components/State.js'
import { registerNodeTypes } from './components/widgets/RegisterNodes.js'

import SceneEditor from './components/SceneEditor.vue'
import FeedEditor from './components/FeedEditor.vue'
import FilesPageEditor from './components/FilesPageEditor.vue'

async function loadApp() {
  const routes = [
    {
      path: '/', name: 'home', component: SceneEditor,
    },
    {
      path: '/files', name: 'files', component: FilesPageEditor,
    },
  ];

  const router = createRouter({
    history: createWebHistory(),
    routes: routes,
  });

  const app = createApp(App)
  app.use(router);

  const editor = await initGlobalApp(app.config.globalProperties.$router)
  registerNodeTypes();

  router.addRoute({
    path: '/feed', name: 'feed', component: FeedEditor,
    props: (route) => {
      return {
        feed: editor.site.postsFeed
      }
    }
  });
  router.addRoute({
    path: '/blog', name: 'blog', component: FeedEditor,
    props: (route) => {
      return {
        feed: editor.site.blogFeed
      }
    }
  });
  router.addRoute({
    path: '/gallery', name: 'gallery', component: FeedEditor,
    props: (route) => {
      return {
        feed: editor.site.galleryFeed
      }
    }
  })

  app.mount('#app')
}

loadApp();

