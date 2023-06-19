<template>
  <div>
    <h2>发布作文</h2>
    <el-form ref="form" :model="essay" :rules="rules" label-width="80px">
      <el-form-item label="标题" prop="title">
        <el-input v-model="essay.title"></el-input>
      </el-form-item>
      <el-form-item label="要求" prop="requirements">
        <el-input type="textarea" v-model="essay.requirements"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="publishEssay">发布</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component';
import {ElMessage, ElMessageBox, ElForm} from 'element-plus';
import {Message} from 'element-plus';

@Options({

})
export default class PublishEssay extends Vue {
  essay = {
    title: '',
    requirements: ''
  };

  rules = {
    title: [
      { required: true, message: '请输入标题', trigger: 'blur' }
    ],
    requirements: [
      { required: true, message: '请输入要求', trigger: 'blur' }
    ]
  };
  $message: Message;

  publishEssay() {
    (this.$refs.form as typeof ElForm).validate((valid: any) => {
      if (valid) {
        // 表单验证通过，可以进行发布作文的操作
        console.log('标题:', this.essay.title);
        console.log('要求:', this.essay.requirements);
        this.$message.success('发布成功');

        // 重置表单
        (this.$refs.form as typeof ElForm).resetFields();
      } else {
        // 表单验证不通过，显示错误信息
        this.$message.error('请填写必填字段');
        return false;
      }
    });
  }
}
</script>
