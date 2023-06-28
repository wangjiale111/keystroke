<template>
  <div class="login-dialog">
    <div class="login-dialog-content">
      <h2 class="title">在线写作分析系统</h2>

      <el-radio-group v-model="userType" style="display: flex; justify-content: flex-start;align-items: center;margin-bottom: 20px;">
        <el-radio-button label="student">学生登录</el-radio-button>
        <el-radio-button label="admin">教师登录</el-radio-button>
      </el-radio-group>

      <el-form :model="form" ref="loginForm" label-width="80px">
        <el-form-item label="教师账号" prop="username" v-show="userType == 'admin'">
          <el-input v-model="form.username" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="学生账号" prop="username" v-show="userType == 'student'">
          <el-input v-model="form.username" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input type="password" v-model="form.password" autocomplete="off"></el-input>
        </el-form-item>
        <div class="footer">
          <el-button type="primary" native-type="submit" @click="login">登录</el-button>
          <el-button class="close-button" @click="close">注册</el-button>
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
    username: '',
    password: ''
  };

  userType = 'student';

  login() {
    this.$refs.loginForm.validate(async valid => {
      if (valid) {
        try {
          let response;
          if (this.userType === 'admin') {
            response = await axios.post(keystrokeUrl + "/admin", {
              adminName: this.form.username,
              password: this.form.password
            });
            if (response.status === 200 && response.data.token !== undefined) {

              console.log("登录成功");
              const token = response.data.token;
              localStorage.setItem("adminToken", token);
              axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
              this.$router.push({name: "user"});

            } else {
              this.$message.error('登录失败');
            }
          } else if (this.userType === 'student') {
            response = await axios.post(keystrokeUrl + "/login", {
              username: this.form.username,
              password: this.form.password
            });
            if (response.status === 200 && response.data.token !== undefined) {
              console.log("登录成功");
              const token = response.data.token;
              localStorage.setItem("studentToken", token);
              axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
              this.$router.push({name: "student"});

            } else {
              this.$message.error('登录失败');
            }
          }

        } catch (error) {
          console.error('登录请求出错', error);
          this.$message.error(error.response.data);
        }
      } else {
        // 表单验证不通过的处理逻辑
      }
    });
  }

  close() {
    this.$emit('close');  // 触发关闭弹窗的事件
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
  background-image: linear-gradient(rgb(255,255,255), rgb(200, 200, 200));
}

.login-dialog-content {
  background-color: white;
  padding: 20px;
  width: 400px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
}

.title {
  font-size: 2em;
  text-align: center;
  margin-bottom: 20px;
}

.login-dialog-content .footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}
</style>