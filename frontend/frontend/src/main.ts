import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
// import './plugins/axios'
import router from './router'
// import axios from './plugins/axios'
import './plugins/api'
import Login from './components/Login.vue'
const app = createApp(App)

app.use(router)

// app.use(axios, {baseUrl: 'http://localhost:8000'})
app.component('login', Login)

app.mount("#app")









