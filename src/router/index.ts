import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import RecordView from "@/views/RecordView.vue";
import ReplayView from "@/views/ReplayView.vue";
import AdminView from "@/views/AdminView.vue";
import UserView from "@/views/UserView.vue";
import dashBoard from "@/views/dashBoard.vue";
import TextView from "@/views/TextView.vue";
import markText from "@/views/markText.vue";

const routes: Array<RouteRecordRaw> = [
    {
        path: "/record",
        name: "record",
        component: RecordView,
        meta: {
            requiresAuth: false,
            keepAlive: true,
            label: "记录", // 添加label属性
        },
    },
    {
        path: "/admin",
        component: AdminView,
        meta: {
            requiresAuth: true,
            key: "admin",
        },
        children: [
            {
                path: "",
                name: "admin",
                component: UserView,
                meta: {
                    key: "user",
                    label: "用户列表", // 添加label属性
                },
            },
            {
                path: "/admin/user",
                name: "user",
                component: UserView,
                meta: {
                    key: "user",
                    label: "用户列表", // 添加label属性
                },
            },
            {
                path: "/admin/dashBoard",
                name: "dashBoard",
                component: dashBoard,
                meta: {
                    key: "dash",
                    label: "数据分析", // 添加label属性
                },
            },
            {
                path: "/admin/markText/:userName",
                name: "markText",
                component: markText,
                meta: {
                    key: "dash",
                    label: "作文点评", // 添加label属性
                },
            },
            {
                path: "/admin/replay/:userName",
                name: "replay",
                component: ReplayView,
                meta: {
                    key: "replay",
                    label: "写作记录回放", // 添加label属性
                },
            },
            {
                path: "/admin/text/:userName",
                name: "text",
                component: TextView,
                meta: {
                    key: "text",
                    label: "原文分析", // 添加label属性
                },
            },
        ],
    },
    {
        path: "/:pathMatch(.*)*",
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
        localStorage.setItem("adminToken", token);
    }
});

export default router;
