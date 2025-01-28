import { createRouter, createWebHistory } from 'vue-router'
import Register from '../components/Register.vue'
import Profile from '../components/Profile.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {path: "/register",  component: Register},
    {path: "/login",  component: () => import('../components/Login.vue')},
    {path: "/profile", component: Profile},
  ],
})

export default router
