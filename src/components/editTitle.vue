<template>
  <div>
    <h2>发布作文</h2>
    <el-form ref="form" :model="essay" :rules="rules" class="title">
      <el-form-item label="标题：" prop="title" style="margin-left: 30px;">
        <el-input v-model="essay.title"></el-input>
      </el-form-item>
      <el-form-item label="要求：" prop="requirements"  style="margin-left: 30px;" >
        <el-input type="textarea" v-model="essay.requirements" :rows="4"></el-input>
      </el-form-item>
      <el-form-item label="写作时间（分钟）：" prop="textTime"  style="margin-left: 30px;">
        <el-input v-model="essay.textTime" type="number" min="0"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="publishEssay">发布</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { ElMessage, ElMessageBox, ElForm } from 'element-plus';
import { Message } from 'element-plus';
import axios from 'axios';
import { keystrokeUrl } from '@/assets/config';

@Options({})

export default class PublishEssay extends Vue {
  essay = {
    title: '',
    requirements: '',
    textTime: 0
  };

  rules = {
    title: [
      { required: true, message: '请输入标题', trigger: 'blur' }
    ],
    requirements: [
      { required: true, message: '请输入要求', trigger: 'blur' }
    ],
    textTime: [
      { required: true, message: '请填写写作时间', trigger: 'blur' }
    ]
  };
  $message: Message;

  mounted() {
    // 在组件挂载后从接口获取数据
    this.getTextInfo();
  }

  async getTextInfo() {
    try {
      const response = await axios.get(keystrokeUrl + '/get_text_info');
      const textInfo = response.data;
      // 将获取到的数据填充到essay对象中
      this.essay.title = textInfo.textTitle;
      this.essay.requirements = textInfo.textRequirement;
      this.essay.textTime = textInfo.textTime;
    } catch (error) {
      console.error(error);
    }
  }

  publishEssay() {
    (this.$refs.form as typeof ElForm).validate(async (valid: any) => {
      if (valid) {
        // 表单验证通过，可以进行发布作文的操作
        try {
          const response = await axios.post(keystrokeUrl + '/update_text_info',
              { textTitle: this.essay.title, textRequirement: this.essay.requirements, textTime: this.essay.textTime });
          this.$message.success('发布成功');
          return response.data;
        } catch (error) {
          console.error(error);
          this.$message.error('发布失败');
        }
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

<style scoped>
.title {
  width: 700px;
  margin-top: 30px;
}
</style>
