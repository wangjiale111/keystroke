import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import RecordView from "@/views/RecordView.vue";
import ReplayView from "@/views/ReplayView.vue";
import AdminView from "@/views/AdminView.vue";
import dashBoard from "@/views/dashBoard.vue";
import TextView from "@/views/TextView.vue";
import markText from "@/views/markText.vue";
import editTitle from "@/components/editTitle.vue";
import studentView from "@/views/studentView.vue";
import LoginDialog from "@/components/LoginDialog.vue";
import classManage from "@/components/admins/classManage.vue";
import UserViews from "@/components/admins/UserView.vue";
import writingList from "@/components/students/writingList.vue";
import historyList from "@/components/admins/historyList.vue";
import historyList2 from "@/components/students/historyList.vue";

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
                component: classManage,
                meta: {
                    key: "classManage",
                    label: "任务列表", // 添加label属性
                    role: "admin",
                },
            },
            {
                path: "/admin/classManage",
                name: "classManage",
                component: classManage,
                meta: {
                    key: "classManage",
                    label: "任务列表", // 添加label属性
                    role: "admin",
                },
            },
            {
                path: "/admin/user",
                name: "user",
                component: historyList,
                meta: {
                    key: "user",
                    label: "历史任务", // 添加label属性
                    role: "admin",
                },
            },
            {
                path: "/admin/history",
                name: "historyList",
                component: historyList,
                meta: {
                    key: "user",
                    label: "历史任务", // 添加label属性
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
                path: "/admin/markText",
                name: "adminMarkText",
                component: markText,
                meta: {
                    key: "dash",
                    label: "作文分析", // 添加label属性
                    role: "admin",
                },
            },
            {
                path: '/admin/replay',
                name: "adminReplay",
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
                path: "/student/markText",
                name: "studentMarkText",
                component: markText,
                meta: {
                    key: "dash",
                    label: "作文分析", // 添加label属性
                    role: "student",
                },
            },
            {
                path: '/student/replay',
                name: "studentReplay",
                component: ReplayView,
                meta: {
                    key: "replay",
                    label: "写作过程分析", // 添加label属性
                    role: "student",
                },
            },
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
                path: "/student/historyList",
                name: "historyList",
                component: historyList2,
                meta: {
                    key: "historyList",
                    label: "我的成绩", // 添加label属性
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
    const userRole = getUserRole(); // 假设你有一个函数来获取当前用户的角色

    if (requiresAuth) {
        if (userRole === 'admin' || userRole === 'student') {
            // 如果是 markText 或 replay 页面，则允许任意持token的用户访问
            if (to.path.endsWith('markText') || to.path.endsWith('replay')) {
                next();
            } else if (userRole === to.meta.role) {
                // 用户角色需和 meta.role 相匹配
                next();  // 如果已经有权限访问，直接next
            } else {
                console.log("你没有权限访问这个页面");
                next({ name: "login" });
            }
        } else {
            console.log("未登录");
            next('/login');  // 如果未登录，重定向到登录页
        }
    } else {
        next();  // 如果不需要权限验证，直接next
    }
});


// 用来获取用户角色的函数，这里简化处理，实际应用可能需要更复杂的逻辑
function getUserRole() {

    if (localStorage.getItem('adminToken')) {
        return 'admin';
    } else if (localStorage.getItem('studentToken')) {
        return 'student';
    }
    return null;
}

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
