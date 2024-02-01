import './assets/main.css'

import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import { initGlobalApp } from './State.js'

import Home from './Home.vue'

const routes = [
  {
    path: '/', name: 'home', component: Home,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes: routes,
})

const app = createApp(App)
app.use(router)

initGlobalApp(
  // app.config.globalProperties.$toast,
  app.config.globalProperties.$router
)

app.mount('#app')
