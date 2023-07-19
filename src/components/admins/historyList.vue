<template>
  <div class="container">
    <div class="table">
      <h3 style="margin-top: 50px;font-family: KaiTi; ">历史任务</h3>
      <el-table :data="historyClasses">
        <!--        <el-table-column prop="id" label="ID" width="180"></el-table-column>-->
        <el-table-column prop="name" label="任务名称" width="80"></el-table-column>
        <el-table-column prop="class_id" label="任务代码" width="80"></el-table-column>
        <!--        <el-table-column prop="created_by" label="创建者" width="180"></el-table-column>-->
        <el-table-column prop="textTitle" label="作文标题" width="200"></el-table-column>
        <el-table-column prop="textRequirement" label="写作要求" width="180"></el-table-column>
        <el-table-column label="写作时间" width="80">
          <template v-slot="{row}">
            {{row.textTime}}分钟
          </template>
        </el-table-column>
        <el-table-column prop="start_date" label="开始日期" width="180"></el-table-column>
        <el-table-column prop="due_date" label="截止日期" width="180"></el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <el-button @click="viewStudents(scope.row.class_id)">学生管理</el-button>
            <el-button type="danger" @click="onDelete(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
          @size-change="handleSizeChange"
          @current-change="historyClassesPageChange"
          :current-page="historyClassesCurrentPage"
          :page-size="pageSize"
          layout="prev, pager, next"
          :total="totalHistoryClasses"
          style="margin-bottom: 100px;"
      ></el-pagination>
    </div>
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>
  </div>
</template>



<script lang="ts">
import {Options, Vue} from 'vue-class-component';
import {keystrokeUrl} from "@/assets/config";
import axios from 'axios';
import {ElForm, ElMessageBox, Message} from "element-plus";
import {useTabsStore} from "@/store";

@Options({})
export default class historyList extends Vue {
  adminId = ''
  classes = []
  historyClasses = []
  showDialog = false
  newClassForm = {
    name: '',
    textTitle: '',
    textRequirement: '',
    textTime: null,
    start_date: null,
    due_date: null
  }
  rules = {
    name: [{required: true, message: '任务名称不能为空', trigger: 'blur'}],
    textTitle: [{required: true, message: '作文标题不能为空', trigger: 'blur'}],
    textRequirement: [{required: true, message: '写作要求不能为空', trigger: 'blur'}],
    textTime: [{required: true, message: '写作时间不能为空', trigger: 'blur'}],
    start_date: [
      {required: true, message: '开始日期不能为空', trigger: 'change'},
      {
        validator: (rule, value, callback) => {
          if (value < new Date()) {
            callback(new Error('开始日期必须为未来日期'));
          } else {
            callback();
          }
        },
        trigger: 'change'
      }],
    due_date: [
      {required: true, message: '截止日期不能为空', trigger: 'change'},
      {
        validator: (rule, value, callback) => {
          if (this.newClassForm.start_date >= value) {
            callback(new Error('截止日期必须在开始日期之后'));
          } else {
            callback();
          }
        },
        trigger: 'change'
      }
    ]
  }
  isLoading = false;
  $message: Message;
  tabsStore = useTabsStore();
  pageSize = 10;
  currentPage = 1;
  totalClasses = 0;
  totalHistoryClasses = 0;
  currentClassesCurrentPage = 1;
  historyClassesCurrentPage = 1;

  async mounted() {
    await this.getData()
  }

  currentClassesPageChange(page) {
    this.currentClassesCurrentPage = page;
    this.getData();
  }

  historyClassesPageChange(page) {
    this.historyClassesCurrentPage = page;
    this.getData();
  }

  handleSizeChange(size){
    this.pageSize = size
    this.getData()
  }

  // 获取表格数据
  async getData(){
    try {
      this.isLoading = true;
      this.adminId = localStorage.getItem('adminId')
      const token = localStorage.getItem('adminToken');
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        }
      };
      const response = await axios.get(`${keystrokeUrl}/classes?adminId=${this.adminId}`, config);

      // 获取当前时间的时间戳
      const now = new Date();
      const nowTimeStamp = now.getTime();

      const allClasses = response.data;

      const currentClasses = allClasses.filter(item => {
        const dueDateTimeStamp = Date.parse(item.due_date);
        return nowTimeStamp <= dueDateTimeStamp;
      });

      const historyClasses = allClasses.filter(item => {
        const dueDateTimeStamp = Date.parse(item.due_date);
        return nowTimeStamp > dueDateTimeStamp;
      });

      // 对不同类型的任务进行不同的分页处理
// Pagination for current classes
      const currentStartIndex = (this.currentClassesCurrentPage - 1) * this.pageSize;
      const currentEndIndex = this.currentClassesCurrentPage * this.pageSize;
      this.classes = currentClasses.slice(currentStartIndex, currentEndIndex);
      this.totalClasses = currentClasses.length;

// Pagination for history classes
      const historyStartIndex = (this.historyClassesCurrentPage - 1) * this.pageSize;
      const historyEndIndex = this.historyClassesCurrentPage * this.pageSize;
      this.historyClasses = historyClasses.slice(historyStartIndex, historyEndIndex);
      this.totalHistoryClasses = historyClasses.length;

      this.isLoading = false;
    } catch (e) {
      console.log(e)
    }
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
          textTitle: this.newClassForm.textTitle,
          textRequirement: this.newClassForm.textRequirement,
          textTime: this.newClassForm.textTime,
          start_date: this.formatDate(this.newClassForm.start_date),
          due_date: this.formatDate(this.newClassForm.due_date),
          created_by: this.adminId
        }, config);
        this.newClassForm.name = '';
        this.newClassForm.textTitle = '';
        this.newClassForm.textRequirement = '';
        this.newClassForm.textTime = null;
        this.newClassForm.start_date = null;
        this.newClassForm.due_date = null;
        this.showDialog = false;
        await this.getData();
      } else {
        return false;
      }
    })
  }

  async onDelete(class_id) {
    ElMessageBox.confirm("是否删除该任务?", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    })
        .then(async () => {
          try {
            const token = localStorage.getItem('adminToken');
            const config = {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': token
              }
            };
            const response =  await axios.delete(`${keystrokeUrl}/classes/${class_id}`, config);
            if (response.status === 200) {
              await this.getData();
            }
            this.$message.success('删除任务成功');
          } catch (error) {
            console.error('Failed to delete user events', error);
            this.$message.error('删除任务失败');
          }
        })
        .catch(() => {
          // 取消
        });

  }

  async viewStudents(class_id) {
    this.$router.push({path: `/admin/users/${class_id}`, query: {class_id: class_id}});

  }

   formatDate = (datetime: any) => {
    const addDateZero = (num: any) => {
      return (num < 10 ? "0" + num : num);
    }
    let d = new Date(datetime);
    return d.getFullYear() + '-' + addDateZero(d.getMonth() + 1) + '-' + addDateZero(d.getDate()) + ' ' + addDateZero(d.getHours()) + ':' + addDateZero(d.getMinutes()) + ':' + addDateZero(d.getSeconds());
  };
}
</script>

<style scoped>
.container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  overflow-y: auto;
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
  height: auto;
}

.table{
  width: 100%;
  min-height: 100%;
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