import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import RecordView from '../views/RecordView.vue'
import ReplayView from "@/views/ReplayView.vue";

const routes: Array<RouteRecordRaw> = [
    {
    path: '/record',
    name: 'record',
    component: RecordView
  },
  {
    path: '/replay',
    name: 'replay',
    component: ReplayView
  },
  {
    path:'/',
    redirect:'/record'
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
