<template>
  <el-dialog
      title="修改密码"
      v-model="dialogVisible"
      append-to-body
      @close="resetForm"
  >
    <el-form ref="myForm" :model="form">
      <el-form-item label="用户名" prop="adminName">
        <el-input v-model="form.adminName" type="text"></el-input>
      </el-form-item>
      <el-form-item label="旧密码" prop="oldPwd">
        <el-input v-model="form.oldPwd" type="password"></el-input>
      </el-form-item>
      <el-form-item label="新密码" prop="newPwd">
        <el-input v-model="form.newPwd" type="password"></el-input>
      </el-form-item>
    </el-form>
    <template v-slot:footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="changePassword">确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" name="PasswordChangeDialog">
import { Options, Vue } from 'vue-class-component';
import axios from 'axios';
import { keystrokeUrl } from '@/assets/config';
import { Message } from 'element-plus';

@Options({
  name: 'PasswordChangeDialog',
})
export default class PasswordChangeDialog extends Vue {
  form = {
    adminName: '',
    oldPwd: '',
    newPwd: '',
  };
  dialogVisible = false;
  $message: Message;

  open() {
    this.dialogVisible = true;
  }

  resetForm() {
    this.form = {
      adminName: '',
      oldPwd: '',
      newPwd: '',
    };
  }

  changePassword() {
    this.dialogVisible = false;
    try {
      axios
          .post(keystrokeUrl + '/update_admin_password', this.form)
          .then((response) => {
            this.$message({
              message: '提交成功',
              type: 'success',
            });
          })
          .catch((error) => {
            console.error(error);
            this.$message({
              message: '提交失败，请检查网络连接',
              type: 'error',
            });
          });
    } catch (error) {
      this.$message({
        message: '提交失败，请联系管理员',
        type: 'error',
      });
      console.log(error);
    }
    this.resetForm()
  }
}
</script>
