import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import PostDetail from '@/views/PostDetail.vue'
import About from '@/views/About.vue'
import Chat from '@/views/Chat.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/post/:id',
    name: 'PostDetail',
    component: PostDetail
  },
  {
    path: '/about',
    name: 'About',
    component: About
  },
  {
    path: '/chat',
    name: 'Chat',
    component: Chat
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router