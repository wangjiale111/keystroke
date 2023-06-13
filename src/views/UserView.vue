<template>
  <div class="user">
    <div class="main">
      <el-input
          class="search-input"
          v-model="searchQuery"
          placeholder="搜索姓名"
          @keyup.enter="searchUserEvents"
      ></el-input>
      <el-table :data="userEvents" border>
        <el-table-column prop="userName" label="姓名" min-width="30"></el-table-column>
        <el-table-column prop="saveTime" label="提交时间" min-width="50"></el-table-column>
        <el-table-column label="操作">
          <template v-slot="scope">
            <el-button type="primary" @click="downloadEventLogs(scope.row.userName)">
              下载写作过程数据
            </el-button>
            <el-button type="primary" @click="downloadForm(scope.row.userName)">
              下载调查问卷
            </el-button>
            <el-button type="success" @click="viewReplay(scope.row.userName)">
              查看回放
            </el-button>
            <el-button @click="deleteUser(scope.row.userName)">
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
      >
      </el-pagination>
    </div>
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>
  </div>
</template>


<script lang="ts">
import {Options, Vue} from 'vue-class-component';
import axios from 'axios';
import {ElMessageBox, Message} from "element-plus";
import Papa from "papaparse";
import {keystrokeUrl} from "@/assets/config";

@Options({
  name: 'UserView',
})
export default class AdminView extends Vue {
  userEvents: any[] = [];
  $message: Message;
  isLoading = true;
  submitTime = "";
  currentPage = 1;
  perPage = 10;
  total = 0;
  searchQuery = "";

  mounted() {
    this.getUserEvents();
  }

  async getUserEvents(page = this.currentPage, perPage = this.perPage, query = this.searchQuery) {
    try {
      const token = localStorage.getItem('adminToken'); // 从本地存储获取JWT令牌
      const config = {
        headers: {
          'Authorization': token // 将JWT令牌添加到请求头
        }
      };
      const response = await axios.get(keystrokeUrl + '/get_all_user_events', { ...config, params: { page, perPage, query } });
      this.userEvents = response.data.data;
      this.total = response.data.total;
      this.isLoading = false;
    } catch (error) {
      this.$message.error('获取用户信息失败');
      console.error('Failed to fetch user events', error);
    }
  }

  async getUserForm(userName: string) {
    try {
      const token = localStorage.getItem('adminToken'); // 从本地存储获取JWT令牌
      const config = {
        headers: {
          'Authorization': token // 将JWT令牌添加到请求头
        }
      };
      const response = await axios.get(keystrokeUrl + `/get_form?userName=${userName}`, config);
      return response.data;
    } catch (error) {
      this.$message.error('获取调查问卷失败');
      console.error('Failed to fetch user form', error);
    }
  }

  async downloadForm(userName: string) {
    try {
      ElMessageBox.confirm("是否下载调查问卷?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
          .then(async () => {
            const userForm = await this.getUserForm(userName);
            if (userForm) {
              // console.log(JSON.parse(JSON.stringify(userForm)))
              this.submitTime = userForm.saveTime;
              console.log(this.submitTime)
              const csv = Papa.unparse(JSON.parse(JSON.stringify(userForm)));
              const csvData = new Blob([csv], {type: "text/csv;charset=utf-8;"});
              const csvURL = window.URL.createObjectURL(csvData);
              const tempLink = document.createElement("a");
              tempLink.href = csvURL;
              tempLink.setAttribute("download", `${userName}-调查问卷.csv`);
              document.body.appendChild(tempLink);
              tempLink.click();
              document.body.removeChild(tempLink);
            } else {
              console.error('User form not found');
            }
          })
          .catch(() => {
            // 取消
          });
    } catch (error) {
      this.$message.error('下载调查问卷失败');
      console.error('Failed to download user form', error);
    }
  }


  async fetchEventLogs(userName: string){
    try {
      const token = localStorage.getItem('adminToken'); // 从本地存储获取JWT令牌
      const config = {
        headers: {
          'Authorization': token // 将JWT令牌添加到请求头
        },
        params: {userName}
      };
      const response = await axios.get(keystrokeUrl + '/get_event_logs', config);
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  async downloadEventLogs(userName: string) {
    await ElMessageBox.confirm("是否下载击键记录数据?", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    })
    .then(async () => {
          const userEvent = await this.fetchEventLogs(userName) as any;
          if (userEvent) {
            const orderedEventLogs = userEvent.eventLogs.map(log => ({
              index: log.index || "",
              classKey: log.classKey || "",
              text: log.text || "",
              ChineseText: log.ChineseText || "",
              IMEBuffer: log.IMEBuffer || "",
              ChineseLength: log.ChineseText ? log.ChineseText.length : 0,
              IMEBuffer_length: log.IMEBuffer ? log.IMEBuffer.length : 0,
              textLength: log.text ? log.text.length : 0,
              keyValue: log.keyValue || "",
              keyAction: log.keyAction || "",
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
    ElMessageBox.confirm("是否删除用户数据?", "提示", {
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
            this.$message.success('删除用户数据成功');
          } catch (error) {
            console.error('Failed to delete user events', error);
            this.$message.error('删除用户数据失败');
          }
        })
        .catch(() => {
          // 取消
        });
  }

  viewReplay(userName: string) {
    this.$router.push({path: "/admin/replay", query: {userName}});
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
.main {
  position: relative;
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

.aside-text {
  text-decoration: none;
}
</style>