import {createRouter, createWebHashHistory, RouteRecordRaw} from 'vue-router'
import RecordView from '../views/RecordView.vue'
import ReplayView from "@/views/ReplayView.vue";
import AdminView from "@/views/AdminView.vue";

const routes: Array<RouteRecordRaw> = [
    {
        path: '/record',
        name: 'record',
        component: RecordView,
        meta: {
            reload: true // 设置 meta 字段为 reload:true
        }
    },
    {
        path: '/replay',
        name: 'replay',
        component: ReplayView
    },
    {
        path: '/admin',
        name: 'admin',
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
