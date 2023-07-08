import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import RecordView from "@/views/RecordView.vue";
import ReplayView from "@/views/ReplayView.vue";
import AdminView from "@/views/AdminView.vue";
import UserView from "@/views/UserView.vue";
import dashBoard from "@/views/dashBoard.vue";
import TextView from "@/views/TextView.vue";
import markText from "@/views/markText.vue";
import editTitle from "@/components/editTitle.vue";
import studentView from "@/views/studentView.vue";
import LoginDialog from "@/components/LoginDialog.vue";
import classManage from "@/components/admins/classManage.vue";
import UserViews from "@/components/admins/UserView.vue";
import writingList from "@/components/students/writingList.vue";

const routes: Array<RouteRecordRaw> = [
    {
        path: "/login",
        name: "login",
        component: LoginDialog,
        meta: {
            requiresAuth: false,
            keepAlive: true,
            label: "登录", // 添加label属性
        },
    },
    {
        path: "/admin",
        component: AdminView,
        meta: {
            requiresAuth: true,
            key: "admin",
            role: "admin",
        },
        children: [
            {
                path: "",
                name: "admin",
                component: UserView,
                meta: {
                    key: "user",
                    label: "学生列表", // 添加label属性
                    role: "admin",
                },
            },
            {
                path: "/admin/classManage",
                name: "classManage",
                component: classManage,
                meta: {
                    key: "classManage",
                    label: "班级管理", // 添加label属性
                    role: "admin",
                },
            },
            {
                path: "/admin/user",
                name: "user",
                component: UserView,
                meta: {
                    key: "user",
                    label: "学生列表", // 添加label属性
                    role: "admin",
                },
            },
            {
                path: "/admin/users/:classId",
                name: "users",
                component: UserViews,
                meta: {
                    key: "users",
                    label: "班级学生", // 添加label属性
                    role: "admin",
                },
            },
            {
                path: "/admin/dashBoard",
                name: "dashBoard",
                component: dashBoard,
                meta: {
                    key: "dash",
                    label: "数据分析", // 添加label属性
                    role: "admin",
                },
            },
            {
                path: "/admin/markText/:userName",
                name: "markText",
                component: markText,
                meta: {
                    key: "dash",
                    label: "作文分析", // 添加label属性
                    role: "admin",
                },
            },
            {
                path: "/admin/replay/:userName",
                name: "replay",
                component: ReplayView,
                meta: {
                    key: "replay",
                    label: "写作过程分析", // 添加label属性
                    role: "admin",
                },
            },
            {
                path: "/admin/text/:userName",
                name: "text",
                component: TextView,
                meta: {
                    key: "text",
                    label: "原文分析", // 添加label属性
                    role: "admin",
                },
            },
            {
                path: "/admin/editTitle",
                name: "editTitle",
                component: editTitle,
                meta: {
                    key: "editTitle",
                    label: "发布作文", // 添加label属性
                    role: "admin",
                }
            }
        ],
    },
    {
        path: "/student",
        component: studentView,
        name: "student",
        meta: {
            requiresAuth: true,
            key: "student",
            role: "student",
        },
        children: [
            {
                path: "",
                name: "writingList",
                component: writingList,
                meta: {
                    key: "writingList",
                    label: "在线写作", // 添加label属性
                    role: "student",
                },
            },
            {
                path: "/student/writingList",
                name: "writingList",
                component: writingList,
                meta: {
                    key: "writingList",
                    label: "任务列表", // 添加label属性
                    role: "student",
                },
            },
            {
                path: "/student/record",
                name: "record",
                component: RecordView,
                meta: {
                    requiresAuth: true,
                    keepAlive: true,
                    label: "在线写作", // 添加label属性
                },
            },
            {
                path: "/student/dashBoard",
                name: "dashBoard",
                component: dashBoard,
                meta: {
                    key: "dash",
                    label: "数据分析", // 添加label属性
                    role: "student",
                },
            },

        ],
    },
    {
        path: "/:pathMatch(.*)*",
        redirect: () => {
            return "/login";
        },
    },
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

router.beforeEach((to, from, next) => {
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

    if(requiresAuth) {
        if(localStorage.getItem('adminToken')) {
            if(to.meta.role === 'admin') {
                next();
            } else {
                console.log("你没有权限访问这个页面");
                next({ name: "login" });
            }
        } else if(localStorage.getItem('studentToken')) {
            if(to.meta.role === 'student') {
                next();
            } else {
                console.log("你没有权限访问这个页面");
                next({ name: "login" });
            }
        } else {
            console.log("未登录");
            next('/login');
        }
    } else {
        next();
    }
});

router.afterEach((to, from) => {
    const adminToken = localStorage.getItem("adminToken");
    const studentToken = localStorage.getItem("studentToken");
    if (adminToken) {
        localStorage.setItem("adminToken", adminToken);
    }
    if(studentToken) {
        localStorage.setItem("studentToken", studentToken);
    }
});

export default router;
