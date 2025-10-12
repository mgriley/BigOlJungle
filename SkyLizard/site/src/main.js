import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { setGlobalApp } from './Globals.js'
import { State } from './State.js';

// Setup the JS state
let jsApp = State.create()
setGlobalApp(jsApp);

createApp(App).mount('#app')
