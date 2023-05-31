<template>
    <div class="admin-login">
        <el-button class="admin-icon" @click="showLoginDialog" v-show="showRecord">
            管理员登录
        </el-button>
    </div>
    <router-view></router-view>
    <LoginDialog v-if="showLogin" @close="closeLoginDialog" @login="handleLogin" />
</template>

<script lang="ts">
import { Options, mixins } from "vue-class-component";
import axios from "axios";
import LoginDialog from "@/components/LoginDialog.vue";
import RecordView from "@/views/RecordView.vue";
import { AppViewModel } from "@/AppViewModel";
import { Message } from "element-plus";
@Options({
    components: {
        LoginDialog,
        RecordView,
    },
})
export default class AppPage extends mixins(AppViewModel) {
    showLogin = false; // 控制登录弹窗显示/隐藏的状态
    showRecord = true;
    // 使用elementui
    $message: Message;

    mounted() {
        this.showRecord = true;
    }

    showLoginDialog(): void {
        this.showLogin = true; // 显示登录弹窗
    }

    closeLoginDialog(): void {
        this.showLogin = false; // 关闭登录弹窗
    }

    async handleLogin(adminName: string, password: string): Promise<void> {
        console.log(adminName, password);
        try {
            const response = await axios.post("http://127.0.0.1:5000/api/admin", {
                adminName,
                password,
            });
            if (response.status === 200 && response.data.token !== undefined) {
                // 登录成功的操作，例如保存登录状态、跳转页面等
                console.log("登录成功");
                const token = response.data.token;
                // 将 token 存储到 localStorage
                localStorage.setItem("adminToken", token);
                axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
                this.showRecord = false;
                this.showLogin = false;
                this.$router.push("/admin");
            } else {
                console.log("登录失败");
            }
        } catch (error) {
            console.error("登录请求出错", error);
            this.$message.error(error.response.data);
        }
    }
}
</script>

<style>
.admin-login {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    margin-right: 250px;
}

.admin-login a {
    display: flex;
    align-items: center;
    color: #2c3e50;
    text-decoration: none;
    margin-left: 10px;
}

.admin-icon {
    position: absolute;
    top: 10px;
    right: 0;
    z-index: 999;
}
</style>
