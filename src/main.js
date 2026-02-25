import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import Dashboard from './views/Dashboard.vue'
import About from './views/About.vue'

const routes = [
  { path: '/', component: Dashboard },
  { path: '/about', component: About }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

createApp(App)
  .use(vuetify)
  .use(router)
  .mount('#app')
