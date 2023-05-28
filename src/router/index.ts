import {createRouter, createWebHashHistory, RouteRecordRaw} from 'vue-router'
import RecordView from '../views/RecordView.vue'
import ReplayView from "@/views/ReplayView.vue";
import AdminView from "@/views/AdminView.vue";

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
        path: '/login',
        name: 'login',
        component: AdminView
    },
    {
        path: '/',
        redirect: '/record'
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router
