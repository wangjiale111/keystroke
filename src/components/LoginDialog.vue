<template>
  <div class="login-dialog">
    <div class="login-dialog-content">
      <span class="title">在线写作分析系统</span>

      <el-radio-group v-if="!showRegister" v-model="userType" style="display: flex; justify-content: flex-start;align-items: center;margin-bottom: 20px;margin-top: 20px;">
        <el-radio-button label="student">学生登录</el-radio-button>
        <el-radio-button label="admin">教师登录</el-radio-button>
      </el-radio-group>

      <el-radio-group v-if="showRegister" v-model="userType" style="display: flex; justify-content: flex-start;align-items: center;margin-bottom: 20px;margin-top: 20px;">
        <el-radio-button label="student">学生注册</el-radio-button>
        <el-radio-button label="admin">教师注册</el-radio-button>
      </el-radio-group>

      <el-form v-if="!showRegister" :model="form" ref="loginForm" label-width="80px">

        <el-form-item label="教师账号" prop="username" v-if="userType == 'admin'">
          <el-input v-model="form.username" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="学生账号" prop="username" v-if="userType == 'student'">
          <el-input v-model="form.username" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input type="password" v-model="form.password" autocomplete="off"></el-input>
        </el-form-item>

        <div class="footer">
          <el-button type="primary" native-type="button" @click.prevent="login">登录</el-button>
          <el-button @click="showRegisterForm">注册</el-button>
        </div>
      </el-form>


      <el-form v-if="showRegister" :model="registerForm" ref="register" label-width="80px" >
        <!-- 教师账号注册 -->
        <!-- 教师姓名 -->
        <el-form-item label="姓名" prop="name" v-if="userType == 'admin'">
          <el-input v-model="registerForm.teacher_name" autocomplete="off"></el-input>
        </el-form-item>
        <!-- 教师工号 -->
        <el-form-item label="工号" prop="employeeId" v-if="userType == 'admin'">
          <el-input v-model="registerForm.employeeId" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="教师账号" prop="admin_name" v-if="userType == 'admin'">
          <el-input v-model="registerForm.admin_name" autocomplete="off"></el-input>
        </el-form-item>

        <!-- 学生账号注册 -->

        <!-- 学生姓名 -->
        <el-form-item label="姓名" prop="name" v-if="userType == 'student'">
          <el-input v-model="registerForm.student_name" autocomplete="off"></el-input>
        </el-form-item>
        <!-- 学生学号 -->
        <el-form-item label="学号" prop="studentId" v-if="userType == 'student'">
          <el-input v-model="registerForm.studentId" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="学生账号" prop="username" v-if="userType == 'student'">
          <el-input v-model="registerForm.username" autocomplete="off"></el-input>
        </el-form-item>

        <!-- 通用字段：密码、手机号、电子邮箱 -->
        <el-form-item label="密码" prop="password">
          <el-input type="password" v-model="registerForm.password" autocomplete="off"></el-input>
        </el-form-item>


        <div class="footer">
          <el-button type="primary" native-type="submit" @click.prevent="register">确认注册</el-button>
          <el-button @click="showLoginForm">返回登录</el-button>
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
    password: '',

  };

  userType = 'student';
  registerForm = {
    teacher_name: '', // 教师姓名
    employeeId: '',   // 教师工号
    student_name: '', // 学生姓名
    studentId: '',    // 学生学号
    username: '',
    password: '',
    admin_name: ''
  };
  showRegister = false;

  login() {
    this.$refs.loginForm.validate(async valid => {
      console.log('开始登录');
      if (valid) {
        try {
          if (this.userType === 'admin') {
            const response = await axios.post(keystrokeUrl + "/admin", {
              adminName: this.form.username,
              password: this.form.password
            });
            if (response.status === 200 && response.data.token !== undefined) {

              console.log("登录成功");
              const token = response.data.token;
              const adminId = response.data.adminId;
              localStorage.setItem("adminId", adminId)
              localStorage.setItem("adminName", this.form.username);
              localStorage.setItem("adminToken", token);
              axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
              this.$router.push({name: "classManage"});

            } else {
              this.$message.error('登录失败');
            }
          } else if (this.userType === 'student') {
            const response = await axios.post(keystrokeUrl + "/login", {
              username: this.form.username,
              password: this.form.password
            });
            if (response.status === 200 && response.data.token !== undefined) {
              console.log("登录成功");
              const token = response.data.token;
              const userId = response.data.userId;
              localStorage.setItem("userId", userId);
              localStorage.setItem("studentName", this.form.username);
              localStorage.setItem("studentToken", token);
              axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
              this.$router.push({name: "writingList"});
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
    return false;
  }

  showRegisterForm() {
    this.showRegister = true;
  }

  showLoginForm() {
    this.showRegister = false;
  }

  async register() {
    this.$refs.register.validate(async valid => {
      if (valid) {
        if (this.userType === 'student') {
          try {
            console.log(this.registerForm)
            const response = await axios.post(keystrokeUrl + "/register", {
              student_name: this.registerForm.student_name, // 学生姓名
              studentId: this.registerForm.studentId,       // 学生学号
              username: this.registerForm.username,
              password: this.registerForm.password
            });

            if (response.status === 201) {
              this.$message.success('注册成功');
              this.showLoginForm();
            } else {
              this.$message.error('注册失败');
            }
          } catch (error) {
            console.error('注册请求出错', error);
            this.$message.error(error.response.data);
          }
        } else if (this.userType === 'admin') {
          try {
            const response = await axios.post(keystrokeUrl + "/add_admin", {
              teacher_name: this.registerForm.teacher_name, // 教师姓名
              employeeId: this.registerForm.employeeId,     // 教师工号
              admin_name: this.registerForm.admin_name,
              password: this.registerForm.password
            });

            if (response.status === 201) {
              this.$message.success('注册成功');
              this.showLoginForm();
            } else {
              this.$message.error('注册失败');
            }
          } catch (error) {
            console.error('注册请求出错', error);
            this.$message.error(error.response.data);
          }
        }
      }
    });
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
  background-image: url("../assets/background.jpeg");
}

.login-dialog-content {
  background-color: white;
  padding: 20px;
  width: 400px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  box-sizing: border-box;

}

.title {
  font-size: 2em;
  text-align: center;
  margin-bottom: 30px;
  color: #3498db;
  font-family: "KaiTi";

}

.login-dialog-content .footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}
</style>