<template>
  <div class="login-dialog">
    <div class="login-dialog-content">
      <h4>管理员登录</h4>
      <el-form :model="form" ref="loginForm" label-width="80px">
        <el-form-item label="账号" prop="adminName">
          <el-input v-model="form.adminName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input type="password" v-model="form.password" autocomplete="off"></el-input>
        </el-form-item>
        <div class="footer">
          <el-button type="primary" native-type="submit" @click="login">登录</el-button>
          <el-button class="close-button" @click="close">关闭</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script>
import { Options, Vue } from 'vue-class-component';
import axios from "axios";
import {keystrokeUrl} from "@/assets/config";

@Options({})
export default class LoginDialog extends Vue {
  form = {
    adminName: '',
    password: ''
  };

  loginFlag = false;

  login() {
    this.$refs.loginForm.validate(async valid => {
      if (valid) {
        // 在这里实现登录逻辑
        // 可以使用 this.form.adminName 和 this.form.password 获取输入的账号和密码
        try {
          const response = await axios.post(keystrokeUrl + "/admin", {
            adminName: this.form.adminName,
            password: this.form.password
          });
          if (response.status === 200 && response.data.token !== undefined) {
            // 登录成功的操作，例如保存登录状态、跳转页面等
            console.log("登录成功");
            this.loginFlag = true;
            const token = response.data.token;
            // 将 token 存储到 localStorage
            localStorage.setItem("adminToken", token);
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            this.$emit('login', this.loginFlag); // 触发登录事件
          } else {
            this.$message.error("登录失败")
          }
        } catch (error) {
          console.error("登录请求出错", error);
          this.$message.error(error.response.data);
        }
      } else {
        // 表单验证不通过的处理逻辑
      }
    });
  }

  close() {
    this.$emit('close'); // 触发关闭弹窗的事件
  }
}
</script>

<style scoped>
.login-dialog {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
}

.login-dialog-content {
  background-color: white;
  padding: 20px;
  width: 400px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
}

.login-dialog-content h4 {
  margin-top: 0;
  margin-bottom: 20px;
}

.login-dialog-content .footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}
</style>
