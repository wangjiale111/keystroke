import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import RecordView from '@/views/RecordView.vue'
import ReplayView from "@/views/ReplayView.vue";
import AdminView from "@/views/AdminView.vue";

const routes: Array<RouteRecordRaw> = [
    {
        path: '/record',
        name: 'record',
        component: RecordView,
        meta: {
            requiresAuth: false // 不需要登录即可访问的页面
        }
    },
    {
        path: '/replay',
        name: 'replay',
        component: ReplayView,
        meta: {
            requiresAuth: true // 需要登录才能访问的页面
        }
    },
    {
        path: '/admin',
        name: 'admin',
        component: AdminView,
        meta: {
            requiresAuth: true // 需要登录才能访问的页面
        }
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

router.beforeEach((to, from, next) => {
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

    // 检查是否需要登录权限
    if (requiresAuth) {
        // 检查登录状态
        const token = localStorage.getItem("adminToken");
        const isAuthenticated = !!token; // 检查 token 是否存在
        if (isAuthenticated) {
            // 已登录，允许导航到目标路由
            next();
        } else {
            // 未登录，重定向到登录页或其他处理
            console.log('未登录');
            next('/record'); // 重定向到登录页
        }
    } else {
        // 不需要登录权限，直接导航到目标路由
        next();
    }
});


export default router
