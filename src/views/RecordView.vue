<template>
  <div class="record">
    <div class="writing">
      <div class="header">
        <div>时间:{{ time }}</div>
        <div style="margin-left: 80px">字数:{{ wordNum }}</div>
      </div>
      <el-input
          type="textarea"
          :rows="10"
          v-model="value"
          :disabled="disable"
          @input="handleInput"
          class="text-area"
      ></el-input>
      <div class="button">
        <el-button type="primary" @click="toStart">开始写作</el-button>
        <el-button type="danger" @click="toStop" style="margin-left: 80px;">结束写作</el-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" name="RecordView">
import { mixins, Options } from 'vue-class-component';
import ReplayView from '@/views/ReplayView.vue';
import { Vue } from "vue-class-component";
import index from "@/store"
import { DomEventRecord } from "@/record/DomEventRecord";

export interface UserViewModel {
  classKey: string;
  modelKey: string;
  modelValue: any;
  // 时间戳
  timeStamp?: number;
  index?: number;
}

let recordData: any;

@Options({
  components: {
    ReplayView
  }
})
export default class WritingRecord extends mixins(Vue) {

  domRecord: any;
  value = '';
  replayData: any[] = [];
  num2 = 0;
  time =  '0分0秒';
  flag = false;
  wordNum = 0;
  disable = true;

  // ...

  /**
   * toStart  开始录制 1.计时器计算时间  2.监听输入框的值 3.调用recordUserViewModel方法 4.将数据存入replayData
   */
  toStart() {
    console.log("record开始")
    this.disable = false;
    // 计时器计算时间
    this.flag = false;
    this.value = '';
    let time = 0;
    const timer = setInterval(() => {
      if (this.flag) {
        clearInterval(timer);
      }
      time++;
      const min = Math.floor(time / 60);
      const sec = time % 60;
      this.time = `${min}分${sec}秒`;
    }, 1000);

    this.domRecord = new DomEventRecord();
    this.domRecord.startRecord((log: any) => {
      // console.log(log);
    });
    this.$watch('value', (newValue: any, oldValue: any) => {
      const data: UserViewModel = {
        classKey: 'writing',
        modelValue: newValue,
        modelKey: 'writing',
        timeStamp: 0
      };
      const temp = this.domRecord.recordUserViewModel(data, 0, 1);
      this.replayData.push(temp);
      this.wordNum = newValue.length;
    }, { deep: true, immediate: true });
  }

  /**
   * toStop  结束录制 1.调用stopRecord方法 2.将数据存入recordData
   */
  toStop() {
    console.log("点击提交，结束录制")
    this.disable = true;
    this.flag = true;
    recordData = this.domRecord.stopRecord((log: any) => {
      console.log(log);
    });
    index.setState(JSON.parse(JSON.stringify(this.replayData)));
  }

  /**
   * handleInput  监听输入框的值
   */
  handleInput() {
    console.log("输入框的值改变了")
  }

}
</script>

<style scoped>
.header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0; /* 添加背景色 */
  padding: 10px 20px; /* 添加内边距 */
  font-family: Arial, sans-serif; /* 修改字体 */
  font-size: 16px; /* 修改字体大小 */
  color: #333; /* 修改字体颜色 */
  width: 100%;
}

.button {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: stretch;
  margin-top: 20px;
}

.record {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.writing {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  width: 800px;
}

.text-area {
  width: 100%;
  resize: none;
}

@media (max-width: 820px) { /* 自定义屏幕宽度阈值，可以根据需要进行调整 */
  .text-area {
    width: 80%;
  }
}

</style>



