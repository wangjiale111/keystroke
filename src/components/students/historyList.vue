<template>
  <div class="container">
    <el-table :data="classes" style="width: 100%">
      <el-table-column prop="class_id" label="任务代码"></el-table-column>
      <el-table-column prop="name" label="任务名称"></el-table-column>
      <el-table-column prop="textTitle" width="200" label="作文题目"></el-table-column>
      <el-table-column prop="textRequirement" label="写作要求"></el-table-column>
      <el-table-column label="写作时间" >
        <template v-slot="{row}">
          {{row.textTime}}分钟
        </template>
      </el-table-column>
      <el-table-column prop="start_date" width="200" label="开始日期"></el-table-column>
      <el-table-column prop="due_date" width="200" label="截止日期"></el-table-column>
      <el-table-column
          prop="created_by"
          label="发布者"
          :formatter="formatAdminNames">
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button
              @click="startWriting(scope.row.textTitle,
                                   scope.row.textRequirement,
                                   scope.row.textTime,
                                   scope.row.class_id,
                                   scope.row.created_by,
                                   scope.row.start_date
                                   )"
          >查看成绩</el-button>
          <!--          <el-button type="danger" @click="onDelete(scope.row.id)">删除任务</el-button>-->
        </template>
      </el-table-column>
    </el-table>
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>
  </div>
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component';
import {keystrokeUrl} from "@/assets/config";
import axios from 'axios';
import {ElTable, ElTableColumn, ElForm, Message} from 'element-plus';
@Options({
  components: {
    ElTable,
    ElTableColumn,
    ElForm
  }
})
export default class WritingList extends Vue {
  token = ''
  userId = ''
  classes = [];
  adminNames = {}; // <---- 添加的admin名称信息存储对象
  isLoading = false;
  showDialog = false
  newClassForm = {
    classId: ''
  }
  rules = {
    classId: [{required: true, message: '任务代码不能为空', trigger: 'blur'}]}
  $message: Message;

  mounted() {
    this.token = localStorage.getItem('studentToken')
    this.userId = localStorage.getItem('userId')
    this.isLoading = true;
    this.getWritingList()
    this.isLoading = false;
  }

  async getWritingList() {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.token
      }
    };
    const response = await axios.get(`${keystrokeUrl}/classes/historyList?userId=${this.userId}`, config);

    // 对数组进行过滤，仅保留超过截止日期的任务
    this.classes = response.data;
    // 提取并去重所有的创建者id
    const adminIds = Array.from(new Set(this.classes.map(item => item.created_by)))
    adminIds.forEach(adminId => this.getAdminName(adminId));
  }

  // 根据管理员ID获取管理员姓名
  async getAdminName(adminId) {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.token
      }
    };
    const adminInfoResponse = await axios.get(`${keystrokeUrl}/get_adminId/${adminId}`, config);
    // console.log(adminInfoResponse.data.adminName)
    this.adminNames[adminId] = adminInfoResponse.data.adminName;

    // 强制表格重新渲染
    this.classes = [...this.classes];
  }

  // 包装formatter函数，返回管理员名称
  formatAdminNames(row) {
    // console.log(this.adminNames[row.created_by])
    return this.adminNames[row.created_by] || '加载中...';
  }

  startWriting(textTitle,textRequirement,textTime,class_id,created_by,start_date){
    // Get the current date and time
    const now = new Date();
    const nowTimeStamp = now.getTime();
    // Get the start date from the parameter and convert it to a date object
    const startDate = Date.parse(start_date);

    // Compare if current date and time is before start date
    if (nowTimeStamp < startDate) {
      // If it is, then show a message telling the user that the start date has not arrived yet
      this.$message({
        message: '未到开始时间!',
        type: 'warning'
      });
    }
    else {
      this.$router.push({
        path: '/student/record',
        query: {
          textTitle: textTitle,
          textRequirement: textRequirement,
          textTime: textTime,
          class_id: class_id,
          created_by: created_by
        }
      })
    }
  }

  async onSubmit() {
    (this.$refs.newClass as typeof ElForm).validate(async (valid: any) => {
      if (valid) {
        const token = localStorage.getItem('studentToken');
        const config = {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': this.token
          }
        };
        const response = await axios.post(keystrokeUrl + '/classes/students', {
          classId: this.newClassForm.classId,
          userId: this.userId
        }, config);
        this.showDialog = false;
        if (response.status === 200) {
          this.$message.success('加入成功');
        } else {
          this.$message.error('加入失败');
        }
        await this.getWritingList();

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
  justify-content: space-around;
  align-items: center;
  margin-top: 30px;
  margin-bottom: 20px;
}

.el-table {
  margin-top: 20px;
}

.table{
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>