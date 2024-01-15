<template>
  <div class="container">
    <el-table :data="textInfoList" style="width: 100%" v-loading="isLoading">
      <el-table-column prop="textTitle" label="标题"></el-table-column>
      <el-table-column prop="textRequirement" label="要求"></el-table-column>
      <el-table-column prop="textTime" label="时间(分钟)" width="100px"></el-table-column>
      <el-table-column prop="submit_date" label="提交时间"></el-table-column>
      <el-table-column
          prop="created_by"
          label="教师"
          :formatter="formatAdminNames">
      </el-table-column>
      <el-table-column label="操作" width="450">
        <template v-slot="scope">
          <el-button type="success" @click="viewReplay(scope.row.class_id)">
            写作过程分析
          </el-button>
          <el-button type="success" @click="viewText(scope.row.class_id, scope.row.textTitle)">
            写作结果分析
          </el-button>
          <el-button
              @click="openScoreDialog(scope.row)"
              :disabled="!scope.row.teacher_grade"
          >
            {{ scope.row.teacher_grade ? '成绩' : '未评分' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[10, 20, 30, 40]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalItems">
    </el-pagination>
    <el-dialog
        title="成绩与点评"
        v-model="showFeedbackDialog"
        class="custom-dialog"
        style="z-index: 999"
        width="40%"
        :append-to-body="true">
      <el-divider style="margin-top: -25px;"></el-divider>
      <div class="dialog-content">
        <p>成绩: {{ currentGrade }}</p>
      </div>
      <div class="dialog-content">
        <p style="margin-bottom: 5px;">教师点评:</p>
        <textarea v-model="currentFeedback" readonly class="feedback-textarea"></textarea>
      </div>
      <template #footer>
    <span class="dialog-footer">
      <el-button @click="showFeedbackDialog = false">确定</el-button>
    </span>
      </template>
    </el-dialog>
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
export default class historyList extends Vue {
  userId = '';
  textInfoList = [];
  isLoading = false;
  showDialog = false
  adminNames = {}; // <---- 添加的admin名称信息存储对象
  token: string;
  studentName: string;
  classes = [];
  showFeedbackDialog = false;
  currentFeedback = '';
  currentGrade = null;

  mounted() {
    this.token = localStorage.getItem('studentToken')
    this.userId = localStorage.getItem('userId')
    this.studentName = localStorage.getItem('studentName')
    console.log(this.studentName)
    this.isLoading = true;
    this.fetchData();
    this.isLoading = false;
  }

  formatAdminNames(row) {
    // console.log(this.adminNames[row.created_by])
    return this.adminNames[row.created_by] || '加载中...';
  }

  openScoreDialog(row) {
    if (row.teacher_grade) {
      this.currentGrade = row.teacher_grade;
      this.currentFeedback = row.feedback;
      this.showFeedbackDialog = true;
      console.log(this.currentGrade, this.currentFeedback, this.showFeedbackDialog)
    }
  }

  async fetchData() {
    const token = localStorage.getItem('studentToken');
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    };
    try {
      this.isLoading = true;
      const response = await axios.get(`${keystrokeUrl}/get_textInfo?userId=${this.userId}`, config);
      this.textInfoList = response.data.textInfo;

      // 获取 user_Text 数据并更新 textInfoList
      const userTextResponse = await axios.get(`${keystrokeUrl}/get_userText?userId=${this.userId}`, config);
      const userTextData = userTextResponse.data.userText;

      this.textInfoList = this.textInfoList.map(textInfo => {
        const userText = userTextData.find(ut => ut.class_id === textInfo.class_id);
        return {
          ...textInfo,
          submit_date: userText ? userText.submit_date : null,
          teacher_grade: userText ? userText.teacher_grade : null,
          feedback: userText ? userText.feedback : null
        };
      });

      // 从 textInfoList 中提取所有不同的 created_by 值
      const adminIds = [...new Set(this.textInfoList.map(item => item.created_by))];

      await Promise.all(adminIds.map(adminId => this.getAdminName(adminId)));

      console.log(this.textInfoList)
    } catch (error) {
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }


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

  viewReplay(class_id) {
    this.$router.push({path: `/student/replay`, query: {userName:this.studentName,userId:this.userId, class_id:class_id}});
  }

  viewText(class_id, textTitle) {
    this.$router.push({path: `/student/markText`, query: {userName:this.studentName,userId:this.userId, class_id:class_id, textTitle: textTitle}});
  }

}
</script>

<style scoped>
.custom-dialog .el-dialog__body {
  font-family: 'Arial', sans-serif; /* 主体文字字体 */
  color: #555; /* 主体文字颜色 */
  line-height: 1.5; /* 行高 */
  padding-top: 1em; /* 上边距 */
  border-top: 1px solid #eee; /* 顶部横线 */
}

.custom-dialog .feedback-textarea {
  width: 100%; /* 宽度充满容器 */
  border: none; /* 无边框 */
  background-color: #f5f5f5; /* 背景颜色 */
  resize: none; /* 禁止调整大小 */
  font-family: 'Arial', sans-serif; /* 字体 */
  color: #555; /* 文字颜色 */
  line-height: 1.5; /* 行高 */
  padding: 10px; /* 内边距 */
  box-sizing: border-box; /* 盒模型 */
  height: 100px; /* 固定高度 */
  overflow-y: auto; /* 当内容超出高度时显示滚动条 */
  margin-top: 5px;
}


.custom-dialog .dialog-content {
  margin-bottom: 1em; /* 每行之间的间距 */
  font-size: 16px; /* 字体大小 */
}

.custom-dialog .el-dialog__header {
  background-color: #f7f7f7; /* 标题栏背景颜色 */
  color: #333; /* 标题栏文字颜色 */
  font-weight: bold; /* 标题栏文字加粗 */
}

.custom-dialog .el-dialog__body {
  font-family: 'Arial', sans-serif; /* 主体文字字体 */
  color: #555; /* 主体文字颜色 */
  line-height: 1.5; /* 行高 */
}

.custom-dialog .el-dialog__footer {
  background-color: #f7f7f7; /* 底部栏背景颜色 */
}

.custom-dialog .dialog-footer {
  text-align: right; /* 底部按钮右对齐 */
  padding: 10px 20px; /* 底部内边距 */
}

.custom-dialog .el-button {
  background-color: #409eff; /* 按钮背景颜色 */
  color: white; /* 按钮文字颜色 */
  border: none; /* 无边框 */
  border-radius: 5px; /* 圆角边框 */
  padding: 10px 15px; /* 内边距 */
  font-weight: bold; /* 文字加粗 */
  transition: background-color 0.3s, box-shadow 0.3s; /* 过渡动画 */
}

.custom-dialog .el-button:hover {
  background-color: #66b1ff; /* 鼠标悬停时按钮背景颜色 */
  box-shadow: 0 2px 4px 0 rgba(0,0,0,0.15); /* 鼠标悬停时阴影效果 */
}


.el-button {
  background-color: #409eff; /* 按钮背景颜色 */
  color: white; /* 按钮文字颜色 */
  border: none; /* 无边框 */
  border-radius: 5px; /* 圆角边框 */
  padding: 10px 15px; /* 内边距 */
  font-weight: bold; /* 文字加粗 */
  transition: background-color 0.3s, box-shadow 0.3s; /* 过渡动画 */
}

.el-button:hover {
  background-color: #66b1ff; /* 鼠标悬停时按钮背景颜色 */
  box-shadow: 0 2px 4px 0 rgba(0,0,0,0.15); /* 鼠标悬停时阴影效果 */
}


.container {
  width: 100%;
  height: 100vh;
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