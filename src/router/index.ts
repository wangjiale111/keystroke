import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import RecordView from "@/views/RecordView.vue";
import ReplayView from "@/views/ReplayView.vue";
import AdminView from "@/views/AdminView.vue";
import UserView from "@/views/UserView.vue";
import dashBoard from "@/views/dashBoard.vue";

const routes: Array<RouteRecordRaw> = [
    {
        path: "/record",
        name: "record",
        component: RecordView,
        meta: {
            requiresAuth: false, // 不需要登录即可访问的页面
            keepAlive: true , // 保持状态
        },
    },
    {
        path: "/admin",
        component: AdminView,
        meta: {
            requiresAuth: true, // 需要登录才能访问的页面
            key:"admin" // 设置 key 值为 "admin"
        },
        children: [
            {
                path: "", // 子路径为空时，为默认路由
                name: "admin",
                component: UserView,
                meta: {
                    key: "user" // 用于keep-alive的key
                }
            },
            {
                path: "/admin/user",
                name: "user",
                component: UserView,
                meta: {
                    key: "user" // 设置 key 值为 "user"
                }
            },
            {
                path: "/admin/dashBoard",
                name: "dashBoard",
                component: dashBoard,
                meta: {
                    key: "dash"
                }
            },
            {
                path: "/admin/replay",
                name: "replay",
                component: ReplayView,
                meta: {
                    key: "replay" // 设置 key 值为 "user"
                }
            },
        ],
    },
    {
        path: "/:pathMatch(.*)*", // 匹配所有路径
        redirect: () => {
            return "/record";
        },
    },
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

router.beforeEach((to, from, next) => {
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

    if (requiresAuth) {
        // 检查登录状态
        const token = localStorage.getItem("adminToken");
        if (token) {
            next();
        } else {
            console.log("未登录");
            next("/record");
        }
    } else {
        next();
    }
});

router.afterEach((to, from) => {
    const token = localStorage.getItem("adminToken");
    if (token) {
        // 更新浏览器中的token
        localStorage.setItem("adminToken", token);
    }
});

export default router;
