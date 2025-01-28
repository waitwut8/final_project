import { createRouter, createWebHistory } from 'vue-router'
import Register from '../components/Register.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {path: "/register",  component: Register},
    {path: "/login",  component: () => import('../components/Login.vue')},
  ],
})

export default router
