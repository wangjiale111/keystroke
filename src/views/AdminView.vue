<template>
  <div>
    <el-table :data="userEvents" border>
      <el-table-column prop="userName" label="姓名"></el-table-column>
      <el-table-column label="操作">
        <template v-slot="scope">
          <el-button type="primary" @click="downloadEventLogs(scope.row.userName)">
            下载击键记录数据
          </el-button>
          <el-button type="success" @click="viewReplay(scope.row.userName)">
            查看回放
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import axios from 'axios';
import {ElMessageBox} from "element-plus";
import Papa from "papaparse";

@Options({
  name: 'AdminView',
})
export default class AdminView extends Vue {
  userEvents: any[] = [];

  mounted() {
    this.getUserEvents();
  }

  async getUserEvents() {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/get_all_user_events');
      this.userEvents = response.data;
    } catch (error) {
      console.error('Failed to fetch user events', error);
    }
  }

  async downloadEventLogs(userName: string) {
    ElMessageBox.confirm("是否下载击键记录数据?", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    })
        .then(() => {
          // 查找匹配的对象
          const userEvent = this.userEvents.find(event => event.userName === userName);
          if (userEvent) {
            // 将eventLogs转换为CSV格式
            const csv = Papa.unparse(userEvent.eventLogs);
            const csvData = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            const csvURL = window.URL.createObjectURL(csvData);
            const tempLink = document.createElement("a");
            tempLink.href = csvURL;
            tempLink.setAttribute("download", userName);
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

  viewReplay(userName: string) {
    this.$router.push({ path: "/replay", query: { userName } });
  }

}
</script>

<style scoped>
</style>
