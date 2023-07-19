<template>
  <div class="record">
    <div class="writing">
      <div class="title">
        <span style="  font-size: 20px;">{{ textTitle }}</span>
        <span style="  font-size: 15px;margin-top: 10px; width:800px;">要求：{{ requirements }}</span>
      </div>
      <div class="header">
        <div>时间:{{ timeFormat }}</div>
        <div style="margin-left: 60px">字数:{{ wordNum }}</div>
      </div>
      <div class="content">
        <div class="recordText">
          <el-input
              type="textarea"
              :rows="8"
              v-model="value"
              :disabled="disable"
              @input="handleInput"
              @keydown="handleKeyDown"
              @paste="handlePaste"
              style="width: 100%; font-size: 20px; border: 1px solid #ccc; border-radius: 4px;"
          ></el-input>
        </div>
      </div>
      <div class="button">
        <el-button type="primary" @click="confirmStartWriting" v-show="showStart">开始写作</el-button>
        <el-button type="danger" @click="confirmEndWriting" style="margin-left: 80px;" :disabled="disable4">
          结束写作
        </el-button>
      </div>
      <div v-if="isLoading" class="loading-overlay">
        <div class="loading-spinner"></div>
      </div>
    </div>

  </div>
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component';
import ReplayView from '@/views/ReplayView.vue';
import {DomEventRecord} from "@/record/DomEventRecord";
// import Papa from "papaparse";
import {ElMessage, ElMessageBox, Message} from 'element-plus';

import {keystrokeUrl} from "@/assets/config";
import axios from "axios";
import LoginDialog from "@/components/LoginDialog.vue";

let recordData: any;

@Options({
  components: {
    ReplayView, LoginDialog
  }
})
export default class WritingRecord extends Vue {

  domRecord: any;
  value = '';
  replayData: any[] = [];
  // 设置时间
  timeFormat = '20分00秒';
  flag = false;
  wordNum = 0;
  disable = true;
  // 设置时间,与timeFormat同步
  time = 1200;
  writingData: any[] = [];

  disable4 = false
  $message: Message;

  showWriting = true;
  showStart = true;
  showForm = false;

  isLoading = true;
  showRecord = true;
  writingFlag = false;


  textTitle = '';
  requirements = '';
  class_id = '';
  adminId = '';
  userId = '';


  async mounted() {
    this.showRecord = true;
    this.isLoading = false;
    this.textTitle = this.$route.query.textTitle as string;
    this.requirements = this.$route.query.textRequirement as string;
    this.class_id = this.$route.query.class_id as string;
    this.adminId = this.$route.query.created_by as string;
    this.userId = localStorage.getItem('userId')
    this.time = this.$route.query.textTime as any * 60;
    this.timeFormat = this.$route.query.textTime + '分00秒';
  }

  /**
   * toStart  开始录制 1.计时器计算时间  2.监听输入框的值 3.调用recordUserViewModel方法
   */
  toStart() {
    this.enterFullScreen();
    console.log("record开始")
    this.disable = false;
    this.showStart = false;
    this.writingFlag = true;
    // 计时器计算时间
    this.flag = false;
    this.value = '';
    const timer = setInterval(() => {
      if (this.flag || this.time <= 0) {
        clearInterval(timer);
        if (this.time <= 0) {
          this.time = 0;
          ElMessageBox.alert("写作时间已到！", "提示", {
            confirmButtonText: "确定",
            type: "warning",
            callback: () => {
              this.showWriting = false;
              this.toStop();
            }
          });
        }
      } else {
        this.time--;
        const min = Math.floor(this.time / 60);
        const sec = this.time % 60;
        this.timeFormat = `${min}分${sec}秒`;
      }
    }, 1000);

    this.domRecord = new DomEventRecord();
    this.domRecord.startRecord((log: any) => {
      if (this.writingFlag) {
        this.writingData.push(log);
      }
    });
    this.$watch('value', (newValue: any, oldValue: any) => {
      // const data: UserViewModel = {
      //     classKey: 'writing',
      //     text: newValue,
      //     timeStamp: 0
      // };
      // const temp = this.domRecord.recordUserViewModel(data, 0, 1);
      // this.replayData.push(temp);
      if (newValue !== null) {
        // console.log(newValue.length);
        this.wordNum = newValue.length;
      }
    }, {deep: true, immediate: true});
  }

  confirmStartWriting() {
    ElMessageBox.confirm("是否开始写作?", "提示", {
      confirmButtonText: "开始",
      cancelButtonText: "取消",
      type: "warning"
    })
        .then(() => {
          this.toStart();
        })
        .catch(() => {
          // 取消开始写作
        });
  }

  confirmEndWriting() {
    ElMessageBox.confirm("是否结束写作?", "提示", {
      confirmButtonText: "结束",
      cancelButtonText: "取消",
      type: "warning"
    })
        .then(() => {
          this.showWriting = false;
          console.log(this.writingData);
          this.toStop();
        })
        .catch(() => {
          // 取消结束写作
        });
  }

  /**
   * toStop  结束录制
   */
  toStop() {
    this.exitFullscreen();
    console.log("点击提交，结束录制");
    this.writingFlag = false;
    this.disable = true;
    this.flag = true;
    recordData = this.domRecord.stopRecord((log: any) => {
      console.log(log);
    });
    this.showForm = true;
    try {
      // 将用户事件日志发送给后端保存到数据库
      axios
          .post(keystrokeUrl + '/save_event_logs', {
            event_logs: this.writingData,
            userId: this.userId,
            adminId: this.adminId,
            class_id: this.class_id,
            textTitle: this.textTitle
          })
          .then(response => {
            // console.log(response.data);
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
  }

  enterFullScreen() {
    const element: any = document.documentElement;
    const requestMethod = element.requestFullscreen || // W3C
        element.mozRequestFullScreen || // Chrome等函数名与W3C有差异
        element.webkitRequestFullscreen || // FireFox等函数名与W3C有差异
        element.msRequestFullscreen; // IE11等函数名与W3C有差异
    if (requestMethod) { // 存在则调用该方法
      requestMethod.call(element);
    }
  }

  exitFullscreen () {
    const documentAny: any = document;
    const exitMethod = document.exitFullscreen || // W3C
        documentAny.mozCancelFullScreen || // Chrome等
        documentAny.webkitExitFullscreen || // Firefox等，注意这里有一个s
        documentAny.msExitFullscreen; // IE11等
    if (exitMethod) { // 存在则调用该方法
      exitMethod.call(document);
    }
  }

  /**
   * handleInput  监听输入框的值
   */
  handleInput() {
    // console.log()
  }


  /**
   * handleKeyDown  监听按键Tab
   */
  handleKeyDown(event) {
    if (event.key === 'Tab') {
      event.preventDefault(); // 阻止默认的焦点切换行为
      const inputValue = this.value;
      const tabCharacter = '\t';
      this.value = inputValue + tabCharacter;
    }
  }

  handlePaste(event) {
    event.preventDefault(); // 阻止默认粘贴行为
  }

}
</script>

<style scoped>
.content {
  width: 80%;
  overflow: auto;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
}

.header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  font-family: Arial, sans-serif; /* 修改字体 */
  font-size: 16px; /* 修改字体大小 */
  color: #333; /* 修改字体颜色 */
  width: 80%;
  box-shadow: none;
}

.title {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.button {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-top: 10px;
  margin-bottom: 20px;
}

.record {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  width: 100%;
  height: 100%;
}

.writing {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  border-radius: 8px;
  width: 100%;
  height: 100%;
  margin: 0 auto;
}

.admin-login a {
  display: flex;
  align-items: center;
  color: #2c3e50;
  text-decoration: none;
  margin-left: 10px;
}

.recordText {
  width: 80%;
  margin: 0 auto;
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



