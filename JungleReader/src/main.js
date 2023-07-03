import './assets/main.css'

import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import VueSelect from 'vue-select'
import App from './App.vue'

import VueFeather from 'vue-feather';

import MainFeed from './components/MainFeed.vue'
import StarredView from './components/StarredView.vue'
import HistoryView from './components/HistoryView.vue'
import PluginsView from './components/PluginsView.vue'
import ImportView from './components/ImportView.vue'
import ExportView from './components/ExportView.vue'
import Settings from './components/Settings.vue'

const routes = [
  {
    path: '/', component: MainFeed
  },
  {
    path: '/starred', component: StarredView
  },
  {
    path: '/history', component: HistoryView
  },
  {
    path: '/plugins', component: PluginsView
  },
  {
    path: '/import', component: ImportView
  },
  {
    path: '/export', component: ExportView
  },
  {
    path: '/settings', component: Settings
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes: routes,
})

const app = createApp(App)
app.use(router)
app.component(VueFeather.name, VueFeather)
app.component("v-select", VueSelect)

app.mount('#app')
