import './assets/main.css'

import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import VueFeather from 'vue-feather';
import App from './App.vue'
import { initGlobalApp } from './components/editor/State.js'
import { registerNodeTypes } from './components/editor/widgets/RegisterNodes.js'

import HomeEditor from './components/editor/HomeEditor.vue'
import FeedEditor from './components/editor/FeedEditor.vue'
import FilesPageEditor from './components/editor/FilesPageEditor.vue'
import DevView from './components/editor/DevView.vue'

async function loadApp() {
  const routes = [
    {
      path: '/', name: 'home', component: HomeEditor,
    },
    {
      path: '/files', name: 'files', component: FilesPageEditor,
    },
    {
      path: '/dev', name: 'dev', component: DevView,
    },
  ];

  const router = createRouter({
    history: createWebHistory(),
    routes: routes,
  });

  const app = createApp(App)
  app.use(router);
  app.component(VueFeather.name, VueFeather)

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

