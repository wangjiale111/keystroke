<template>
  <div class="container">
    <el-button type="primary" @click="showDialog = true" style="margin-left: 10px;">添加班级</el-button>
    <div class="modal" v-show="showDialog">
      <el-form :model="newClassForm" ref="newClass" label-width="120px" :rules="rules" style="margin: 30px 40px 20px 10px;">
        <el-form-item label="班级名称" prop="name">
          <el-input v-model="newClassForm.name"></el-input>
        </el-form-item>
      </el-form>
      <div class="footer">
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="onSubmit">确认</el-button>
      </div>
    </div>
    <div class="table">
      <el-table :data="classes" style="width: 100%">
<!--        <el-table-column prop="id" label="ID" width="180"></el-table-column>-->
        <el-table-column prop="name" label="名称" width="180"></el-table-column>
        <el-table-column prop="class_id" label="班级代码" width="180"></el-table-column>
        <el-table-column prop="created_by" label="操作" width="180"></el-table-column>
      </el-table>
    </div>

  </div>
</template>



<script lang="ts">
import {Options, Vue} from 'vue-class-component';
import {keystrokeUrl} from "@/assets/config";
import axios from 'axios';
import {ElForm} from "element-plus";

@Options({})
export default class ClassManage extends Vue {
  adminId = ''
  classes = []
  showDialog = false
  newClassForm = {name: ''}
  rules = {
    name: [{required: true, message: '班级名称不能为空', trigger: 'blur'}]
  }

  async mounted() {
    this.adminId = localStorage.getItem('adminId')
    const token = localStorage.getItem('adminToken');
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    };
    const response = await axios.get(`${keystrokeUrl}/classes?adminId=${this.adminId}`, config);
    this.classes = response.data
  }

  async onSubmit() {
    (this.$refs.newClass as typeof ElForm).validate(async (valid: any) => {
      if (valid) {
        const token = localStorage.getItem('adminToken');
        const config = {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          }
        };
        const response = await axios.post(keystrokeUrl + '/classes', {
          name: this.newClassForm.name,
          created_by: this.adminId
        }, config);
        this.newClassForm.name = '';
        this.showDialog = false;
        this.classes = (await axios.get(`${keystrokeUrl}/classes?adminId=${this.adminId}`, config)).data;
      } else {
        return false;
      }
    })
  }
}
</script>

<style scoped>
.container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
}

.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  height: auto;
  background-color: #faf8f8;
  z-index: 999;
  border: 1px solid #bdb7b7;
  border-radius: 5px;
}

.footer {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  margin-bottom: 20px;
}

.el-table {
  margin-top: 20px;
}
</style>