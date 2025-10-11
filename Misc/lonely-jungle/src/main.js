import './assets/main.css'

import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import { initGlobalApp } from './State.js'

import Home from './Home.vue'
import UserPage from './UserPage.vue'
import SettingsPage from './SettingsPage.vue'

const routes = [
  {
    path: '/', name: 'home', component: Home,
  },
  {
    path: '/settings', name: 'settings', component: SettingsPage,
  },
  {
    path: '/j/:id', name: 'page', component: UserPage,
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
  null,
  app.config.globalProperties.$router
)

app.mount('#app')
