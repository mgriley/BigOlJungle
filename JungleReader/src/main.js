import './assets/main.css'

import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import { initGlobalReader } from './State.js'

import ToastPlugin from 'vue-toast-notification'
// import 'vue-toast-notification/dist/theme-default.css';
import './toast-theme.css';

import VueFeather from 'vue-feather';

import MainFeed from './components/MainFeed.vue'
import ExploreView from './components/ExploreView.vue'
import StarredView from './components/StarredView.vue'
import HistoryView from './components/HistoryView.vue'
import PluginsView from './components/PluginsView.vue'
import Settings from './components/Settings.vue'
import AboutView from './components/AboutView.vue'
import FeedView from './components/FeedView.vue'
import PrivacyPolicy from './components/PrivacyPolicy.vue'
import AddSupportView from './components/AddSupportView.vue'
import StyleTestView from './components/StyleTestView.vue'

const routes = [
  {
    path: '/', name: 'mainfeed', component: MainFeed,
  },
  {
    path: '/feed/:id', name: 'feed', component: FeedView,
  },
  {
    path: '/addfeed', name: 'addfeed',
  },
  {
    path: '/explore', name: 'explore', component: ExploreView
  },
  {
    path: '/settings', name: 'settings', component: Settings
  },
  {
    path: '/plugins', name: 'plugins', component: PluginsView
  },
  {
    path: '/about', name: 'about', component: AboutView
  },
  {
    path: '/privacypolicy', name: 'privacypolicy', component: PrivacyPolicy
  },
  {
    path: '/addsupport', name: 'addsupport', component: AddSupportView
  },
  {
    path: '/style', name: 'style', component: StyleTestView
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes: routes,
  scrollBehavior(to, from, savedPosition) {
    // always scroll to top
    return { top: 0 }
  },
})

const app = createApp(App)
app.use(router)
app.use(ToastPlugin)
app.component(VueFeather.name, VueFeather)

// For some reason doing app.$toast does not work here.
// console.log("Globals: ", app.config.globalProperties);
// console.log("Toaster: ", app.config.globalProperties.$toast);
initGlobalReader(app.config.globalProperties.$toast,
  app.config.globalProperties.$router)

app.mount('#app')

