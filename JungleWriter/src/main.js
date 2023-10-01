import './assets/main.css'

import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import VueFeather from 'vue-feather';
import App from './App.vue'

const app = createApp(App)
app.component(VueFeather.name, VueFeather)

app.mount('#app')
