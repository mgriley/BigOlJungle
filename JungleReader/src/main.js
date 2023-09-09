import './assets/main.css'
// TODO - not sure how to get this working.
// import './assets/acorn_interpreter.js'
// import '../node_modules/rss-parser/dist/rss-parser.min.js'

import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import { initGlobalReader } from './State.js'

import ToastPlugin from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-default.css';

import VueFeather from 'vue-feather';

import MainFeed from './components/MainFeed.vue'
import ExploreView from './components/ExploreView.vue'
import StarredView from './components/StarredView.vue'
import HistoryView from './components/HistoryView.vue'
import PluginsView from './components/PluginsView.vue'
import ImportView from './components/ImportView.vue'
import ExportView from './components/ExportView.vue'
import Settings from './components/Settings.vue'
import AboutView from './components/AboutView.vue'
import FeedView from './components/FeedView.vue'
import PrivacyPolicy from './components/PrivacyPolicy.vue'
import GetReadView from './components/GetReadView.vue'

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
    path: '/import', name: 'import', component: ImportView
  },
  {
    path: '/export', name: 'export', component: ExportView
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
    path: '/getread', name: 'getread', component: GetReadView
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes: routes,
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

