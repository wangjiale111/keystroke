<template>
  <el-dialog
      title="修改个人信息"
      v-model="dialogVisible"
      append-to-body
      @close="resetForm"
  >
    <el-form ref="myForm" :model="form">
      <el-form-item label="教师姓名" prop="teacherName">
        <el-input v-model="form.teacherName" type="text"></el-input>
      </el-form-item>
      <el-form-item label="工号" prop="employeeId">
        <el-input v-model="form.employeeId" type="text"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="oldPwd">
        <el-input v-model="form.oldPwd" type="password"></el-input>
      </el-form-item>
    </el-form>
    <template v-slot:footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="updateInfo">确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script lang="ts" name="infoChangeDialog">
import { Options, Vue } from 'vue-class-component';
import axios from 'axios';
import { keystrokeUrl } from '@/assets/config';
import { Message } from 'element-plus';

@Options({
  name: 'infoChangeDialog',
})
export default class infoChangeDialog extends Vue {
  form = {
    adminId: '',
    teacherName: '',
    employeeId: '',
    oldPwd: ''
  };
  dialogVisible = false;
  $message: Message;


  open() {
    // 从接口获取当前用户信息
    try {
      this.form.adminId = localStorage.getItem('adminId');
      axios
          .post(keystrokeUrl + '/getInfo', this.form)
          .then((response) => {
            this.form.teacherName = response.data.teacherName;
            this.form.employeeId = response.data.employeeId;
          })
          .catch((error) => {
            console.error(error);
            this.$message({
              message: '信息获取失败，请检查网络连接',
              type: 'error',
            });
          });
    } catch (error) {
      this.$message({
        message: '信息获取失败，请联系管理员',
        type: 'error',
      });
      console.log(error);
    }

    this.dialogVisible = true;
  }

  resetForm() {
    this.form = {
      adminId: '',
      teacherName: '',
      employeeId: '',
      oldPwd: ''
    };
  }

  updateInfo() {
    this.dialogVisible = false;
    try {
      this.form.adminId = localStorage.getItem('adminId');
      axios
          .post(keystrokeUrl + '/updateInfo', this.form)
          .then((response) => {
            this.$message({
              message: '信息更新成功',
              type: 'success',
            });
          })
          .catch((error) => {
            console.error(error);
            this.$message({
              message: '信息更新失败，请检查网络连接',
              type: 'error',
            });
          });
    } catch (error) {
      this.$message({
        message: '信息更新失败，请联系管理员',
        type: 'error',
      });
      console.log(error);
    }
    this.resetForm();
  }
}
</script>
