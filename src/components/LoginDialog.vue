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

@Options({})
export default class LoginDialog extends Vue {
  form = {
    adminName: '',
    password: ''
  };

  login() {
    this.$refs.loginForm.validate(valid => {
      if (valid) {
        // 在这里实现登录逻辑
        // 可以使用 this.form.adminName 和 this.form.password 获取输入的账号和密码
        this.$emit('login', this.form.adminName, this.form.password); // 触发登录事件，传递管理员名字和密码
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
