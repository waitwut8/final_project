import { createRouter, createWebHistory } from 'vue-router'
import Register from '../components/Register.vue'
import Profile from '../components/Profile.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {path: "/register",  component: Register},
    {path: "/login",  component: () => import('../components/Login.vue')},
    {path: "/profile", component: Profile},
    {path: "/admin_u", component: () => import('../components/AdminUserManage.vue')},
  ],
})

export default router
