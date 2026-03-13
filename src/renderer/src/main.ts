import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHashHistory } from 'vue-router'
import './assets/theme.css'
import App from './App.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('./views/HomeView.vue')
    }
  ]
})

const pinia = createPinia()

const app = createApp(App)
app.use(pinia)
app.use(router)
app.mount('#app')
