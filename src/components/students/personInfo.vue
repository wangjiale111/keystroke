<template>
  <div>
    <div class="form" >
      <h3>基本信息</h3>
      <el-form ref="myForm"
               :model="form"
               label-width="120px"
               style="margin-top: 10px"
               :rules="formRules">
        <el-form-item label="用户名" prop="userName">
          <el-input
              v-model="form.userName"
              placeholder="请输入用户名"

          ></el-input>
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-select v-model="form.gender" placeholder="请选择性别" >
            <el-option label="男" value="male"></el-option>
            <el-option label="女" value="female"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="年龄" prop="age">
          <el-input
              v-model="form.age"
              placeholder="请输入年龄"
              type="number"
              min="16"
          ></el-input>
        </el-form-item>
      </el-form>
      <div style="margin-top: 100px;margin-bottom: 20px;">
        <h3>问卷调查</h3>
        <div class="question-container">
          <h3>{{ currentQuestion.label }}</h3>
          <el-radio-group v-model="answers[currentQuestion.key]">
            <el-radio v-for="(option, optionIndex) in currentQuestion.options" :key="optionIndex"
                      :label="option.value" >
              {{ option.label }}
            </el-radio>
          </el-radio-group>
        </div>
        <div class="navigation-buttons">
          <el-button :disabled="currentIndex === 0" @click="prevQuestion">
            上一题
          </el-button>
          <el-button  :disabled="currentIndex === questions.length - 1" style="margin-left: 30px;"
                      @click="nextQuestion">
            下一题
          </el-button>
        </div>
      </div>
    </div>
    <div class="button">
      <el-button type="primary" @click="confirmSubmit" :disabled="disable3" style="margin-top: 100px;">提交调查问卷</el-button>
    </div>
  </div>
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component';
import {question} from "@/utils/studentData";
import {FormRules} from "element-plus/lib/components";
import {Message} from "element-plus";
import {ElMessage, ElMessageBox, ElForm} from 'element-plus';
import axios from "axios";
import {keystrokeUrl} from "@/assets/config";

@Options({
})
export default class personInfo extends Vue {
  form = {
    userName: '',
    gender: '',
    age: ''
  };
  formRules = {
    userName: [{required: true, message: '请输入用户名', trigger: 'blur'}],
    gender: [{required: true, message: '请选择性别', trigger: 'change'}],
    age: [
      {required: true, message: '请输入年龄', trigger: 'blur'}
    ]
  };
  questions = question;
  $message: Message;
  currentIndex = 0;
  answers: Record<string, string> = {};

  get currentQuestion() {
    return this.questions[this.currentIndex];
  }

  prevQuestion() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  nextQuestion() {
    if (this.currentIndex < this.questions.length - 1) {
      this.currentIndex++;
    }
  }

  confirmSubmit() {
    (this.$refs.myForm as typeof ElForm).validate(
        (valid: any) => {
          if (valid) {
            ElMessageBox.confirm('提交后不可更改，是否提交？', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              // 提交所有数据
              console.log(this.answers)
              try {
                // 将用户事件日志发送给后端保存到数据库
                axios
                    .post(keystrokeUrl + '/save_event_logs', {
                      userName: this.form.userName,
                      gender: this.form.gender,  // 添加调查问卷相关字段
                      age: this.form.age,
                      answers: this.answers
                    })
                    .then(response => {

                      this.$message({
                        message: '提交成功',
                        type: 'success'
                      });
                    })
                    .catch(error => {
                      console.error(error);
                      this.$message({
                        message: '提交失败，请检查网络连接',
                        type: 'error'
                      });
                    });
              } catch (error) {
                this.$message({
                  message: '提交失败，请联系管理员',
                  type: 'error'
                });
                console.log(error);
              }
            }).catch(() => {
              // 取消提交
              ElMessage.info('已取消提交');
            });
          } else {
            return false;
          }
        });
  }


}
</script>

<style scoped>

</style>