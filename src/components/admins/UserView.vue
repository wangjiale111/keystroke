<template>
  <div class="user">
    <div class="main">
      <div class="header">
        <div style="margin-top: 5px;">搜索用户：</div>
        <el-input
            class="search-input"
            v-model="searchQuery"
            placeholder="请输入姓名"
            @keyup.enter="searchUserEvents"
            style="width: 300px; margin-right: 10px;"
        ></el-input>
        <el-button type="primary" @click="searchUserEvents">搜索</el-button>
      </div>
      <el-table :data="userEvents" border>
        <el-table-column prop="userName" label="姓名" min-width="20"></el-table-column>
        <el-table-column prop="textTitle" label="作文题目" min-width="30"></el-table-column>
        <el-table-column prop="saveTime" label="提交时间" min-width="20"></el-table-column>
        <el-table-column label="操作">
          <template v-slot="scope">
            <el-button type="success" @click="viewReplay(scope.row.userName, scope.row.userId, scope.row.class_id)">
              写作过程分析
            </el-button>
            <el-button type="success" @click="viewText(scope.row.userName, scope.row.userId, scope.row.class_id, scope.row.textTitle)">
              写作结果分析
            </el-button>
            <el-button @click="openScoreDialog(scope.row)">
              评分
            </el-button>
            <el-button @click="deleteUser(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-size="perPage"
          layout="total, sizes, prev, pager, next, jumper"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          style="margin-top: 30px;"
      >
      </el-pagination>
    </div>
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>

    <!-- 评分弹窗 -->
    <!-- 自定义模态弹窗 -->
    <div class="modal" v-show="showDialog">
      <!-- 模态弹窗的内容 -->
      <div style="margin: 10px 0 -10px 20px">
        <span>评分</span>
      </div>
      <el-divider></el-divider>
      <el-form :model="scoreData" ref="scoreForm" label-width="120px" style="margin: 30px 40px 20px 10px;">
        <el-form-item label="评分" prop="score">
          <el-input v-model="scoreData.score" type="number"></el-input>
        </el-form-item>
        <el-form-item label="评语" prop="feedback">
          <el-input v-model="scoreData.feedback" type="textarea"></el-input>
        </el-form-item>
      </el-form>
      <div class="footer">
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="submitScore">确认</el-button>
      </div>
    </div>


  </div>
</template>



<script lang="ts">
import {Options, Vue} from 'vue-class-component';
import axios from 'axios';
import {ElMessageBox, Message} from "element-plus";
import Papa from "papaparse";
import {keystrokeUrl} from "@/assets/config";
import editTitle from "@/components/editTitle.vue";

@Options({
  name: 'UserView',
  components: {editTitle}
})
export default class AdminView extends Vue {
  userEvents: any[] = [];
  $message: Message;
  isLoading = true;
  currentPage = 1;
  perPage = 10;
  total = 0;
  searchQuery = "";
  adminId = "";
  class_id = "";
  isScoreDialogVisible = false; // 控制评分弹窗的显示
  scoreData = { score: 0, feedback: '' }; // 存储评分和评语
  selectedUser: any = null; // 当前选中的用户
  showDialog = false; // 控制自定义模态弹窗的显示

  mounted() {
    this.getUserEvents();
  }

  openScoreDialog(row) {
    this.selectedUser = row;
    this.fetchScoreData(); // 在打开弹窗前获取评分数据
    this.showDialog = true;
  }

  async fetchScoreData() {
    try {
      const token = localStorage.getItem('adminToken');
      const config = {
        headers: {
          'Authorization': token
        }
      };
      const response = await axios.get(`${keystrokeUrl}/get_user_text?userId=${this.selectedUser.userId}`, config);
      if (response.status === 200 && response.data.length > 0) {
        // 假设后端返回的数据是一个数组，我们只取第一个元素
        const userData = response.data[0];
        this.scoreData.score = userData.teacher_grade || 0; // 如果没有评分，则默认为 0
        this.scoreData.feedback = userData.feedback || ''; // 如果没有评语，则为空字符串
      }
    } catch (error) {
      console.error('Failed to fetch score data', error);
    }
  }

  async submitScore() {
    try {
      this.showDialog = false; // 提交成功或失败后，隐藏模态弹窗
      const token = localStorage.getItem('adminToken');
      const config = {
        headers: {
          'Authorization': token
        }
      };
      const data = {
        userId: this.selectedUser.userId,
        class_id: this.selectedUser.class_id,
        teacher_grade: this.scoreData.score,
        feedback: this.scoreData.feedback
      };
      const response = await axios.post(keystrokeUrl + '/submit_score', data, config);
      if (response.status === 200) {
        this.$message.success('评分提交成功');
      } else {
        this.$message.error('评分提交失败');
      }
    } catch (error) {
      console.error('Failed to submit score', error);
      this.$message.error('评分提交失败');
    }
    this.isScoreDialogVisible = false;
  }

  async getUserEvents(page = this.currentPage, perPage = this.perPage, query = this.searchQuery) {
    try {
      this.adminId = localStorage.getItem('adminId');
      const token = localStorage.getItem('adminToken'); // 从本地存储获取JWT令牌
      this.class_id = this.$route.params.classId as string; // 从路由查询参数获取class_id
      console.log(this.class_id)
      // console.log('class:'+class_id)
      const config = {
        headers: {
          'Authorization': token // 将JWT令牌添加到请求头
        }
      };
      const response = await axios.get(keystrokeUrl + '/get_all_user_event', { ...config, params: { page, perPage, query, adminId: this.adminId, class_id: this.class_id } }); // 在请求参数中添加新的class_id字段
      console.log(response.data)
      this.userEvents = response.data.data;
      this.total = response.data.total;
      this.isLoading = false;
    } catch (error) {
      this.isLoading = false;
      this.$message.error('获取学生信息失败');
      console.error('Failed to fetch user events', error);
    }
  }

  async fetchEventLogs(userId, class_id) {
    try {
      const token = localStorage.getItem('adminToken'); // 从本地存储获取JWT令牌
      const config = {
        headers: {
          'Authorization': token // 将JWT令牌添加到请求头
        },
        params: {userId: userId, class_id: class_id}
      };
      const response = await axios.get(keystrokeUrl + '/get_event_logs', config);
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  async downloadEventLogs(userName, userId, class_id) {
    await ElMessageBox.confirm("是否下载击键记录数据?", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    })
    .then(async () => {
          const userEvent = await this.fetchEventLogs(userId, class_id) as any;
          if (userEvent) {
            const orderedEventLogs = userEvent.event_logs.map(log => ({
              index: log.index || "",
              classKey: log.classKey || "",
              text: log.text || "",
              ChineseText: log.ChineseText || "",
              IMEBuffer: log.IMEBuffer || "",
              ChineseLength: log.ChineseText ? log.ChineseText.length : 0,
              IMEBuffer_length: log.IMEBuffer ? log.IMEBuffer.length : 0,
              textLength: log.text ? log.text.length : 0,
              keyValue: log.keyValue || "",
              textPosition: log.textPosition || "",
              keyAction: log.keyAction || "",
              selector: log.selector || "",
              timeStamp: log.timeStamp || ""
            }));

            // console.log(orderedEventLogs)
            const csv = Papa.unparse(orderedEventLogs);
            const csvData = new Blob([csv], {type: "text/csv;charset=utf-8;"});
            const csvURL = window.URL.createObjectURL(csvData);
            const tempLink = document.createElement("a");
            tempLink.href = csvURL;
            tempLink.setAttribute("download", `${userName}_eventLogs.csv`);
            document.body.appendChild(tempLink);
            tempLink.click();
            document.body.removeChild(tempLink);
          } else {
            console.error("User event not found");
          }

        })
        .catch(() => {
          // 取消
        });
  }

  async deleteUser(userName: string) {
    ElMessageBox.confirm("是否删除学生数据?", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    })
        .then(async () => {
          try {
            const token = localStorage.getItem('adminToken'); // 从本地存储获取JWT令牌
            const config = {
              headers: {
                'Authorization': token // 将JWT令牌添加到请求头
              }
            };
            const response = await axios.post(keystrokeUrl + '/delete_user_events', {userName}, config);
            if (response.status === 200) {
              await this.getUserEvents();
            }
            this.$message.success('删除学生数据成功');
          } catch (error) {
            console.error('Failed to delete user events', error);
            this.$message.error('删除学生数据失败');
          }
        })
        .catch(() => {
          // 取消
        });
  }

  viewReplay(userName, userId, class_id) {
  this.$router.push({path: `/admin/replay`, query: {userName:userName,userId:userId, class_id:class_id}});
  }

  viewText(userName, userId, class_id, textTitle) {
    this.$router.push({path: `/admin/markText`, query: {userName:userName,userId:userId, class_id:class_id, textTitle: textTitle}});
  }

  viewMistake(userName: string){
    this.$router.push({path: `/admin/text/${userName}`});
  }


  handleSizeChange(val) {
    this.perPage = val;
    this.getUserEvents();
  }

  handleCurrentChange(val) {
    this.currentPage = val;
    this.getUserEvents();
  }

  searchUserEvents() {
    this.getUserEvents();
  }

}
</script>

<style scoped>
.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  background-color: white;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  border-radius: 5px;
  width: 50%; /* 或您希望的宽度 */
  max-width: 600px; /* 最大宽度，确保在小屏幕上也能良好显示 */
  padding: 20px;
  display: flex;
  flex-direction: column;
  border: 1px lightblue solid;
}

.modal > div {
  margin-bottom: 20px;
}

.footer {
  display: flex;
  justify-content: flex-end;
}

.el-form-item {
  margin-bottom: 15px;
}

.el-input, .el-input-number, .el-date-picker {
  width: 100%; /* 让输入框填充整个表单项宽度 */
}

.main {
  position: relative;
  margin-top: 40px;
  margin-bottom: 30px;
}

.header{
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  margin-bottom: 20px;
}

.search-input {
  margin-bottom: 20px;
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

.el-table .cell {
  padding: 6px 0;
}
</style>