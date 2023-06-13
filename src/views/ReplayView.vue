<template>
  <div class="replayContent">
    <div class="username">用户名: {{ userName }}</div>
    <div class="replay">
      <div class="composition">
        <div class="mistakeTable">
          <el-button @click="showMistake" class="red-button">纠错</el-button>
          <el-table :data="mistakes" v-show="showMistakeFlag" v-if="mistakes.length > 0">
            <el-table-column prop="mistake" label="错误" />
            <el-table-column prop="correct" label="建议" />
            <el-table-column label="操作" >
              <el-button @click="ignoreMistake(index)" style="width: 2em; height: 2em;">
                忽略
              </el-button>
            </el-table-column>
          </el-table>
        </div>
        <div v-html="getHighlightedText()" class="replayText"/>
      </div>
      <div class="writingReplay">
        <div class="content">
          <el-input
              type="textarea"
              :rows="10"
              v-model="value"
              :disabled="true"
              class="text-area"
          ></el-input>
        </div>
        <div class="header">
          <div class="header-item">写作总时间:{{ time }}</div>
          <div class="header-item">写作速度:{{ typeSpeed }}字/分钟、{{ typeSpeedSecond }}字/秒</div>
          <div class="header-item">写作总字数:{{ writingLength }}</div>
        </div>
        <div class="playButton">
          <el-button type="primary" @click="Replay">开始回放</el-button>
          <el-button type="danger" @click="exitReplay">暂停回放</el-button>
        </div>
      </div>
    </div>
    <div id="chart" class="chart"></div>
  </div>
</template>

<script lang="ts" name="ReplayView">
import {mixins, Options, Vue} from 'vue-class-component';
import {DomEventRecord} from '@/record/DomEventRecord';
import * as echarts from 'echarts';
import axios from 'axios';
import {keystrokeUrl} from "@/assets/config";
import {ElRow, ElCol, ElMenu, ElMenuItem, ElButton} from "element-plus";
import {Message} from 'element-plus';

@Options({
  components: {ElButton}
})
export default class ReplayView extends mixins(Vue) {
  viewModelPlayback: any;
  domRecord = new DomEventRecord();
  replayData: any;
  value = '';
  typeNum = 0;
  typeLength = 0;
  startTime = 0;
  typeTime = 0;
  typeSpeed = 0;
  typeSpeedSecond = 0;
  allTime = 0;
  time = '00分00秒';
  writingLength = 0;
  flag = 1;
  timing: any;
  chart: any;
  timeArray: any[] = [];
  speedArray: any[] = [];
  lengthArray: any[] = [];
  userName: any;
  numSecond = 0;
  index = 0;
  writingTime = 120;
  result: any[] = [];
  finalText = '';
  mistakeStr: '';
  mistakes: any[] = [];
  showMistakeFlag = false;
  $message: Message;

  /**
   * 生命周期 created
   */
  async created() {
    (window as any).playbackInProgress = false;
    this.userName = this.$route.query.userName;
    await this.fetchMistake();
    // await this.getReplayData(this.time);
  }

  async fetchEventLogs() {
    try {
      const token = localStorage.getItem('adminToken'); // 从本地存储获取JWT令牌
      const config = {
        headers: {
          'Authorization': token // 将JWT令牌添加到请求头
        },
        params: {userName: this.userName}
      };
      const response = await axios.get(keystrokeUrl + '/get_event_logs', config);
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  async fetchMistake() {
    try {
      const token = localStorage.getItem('adminToken'); // 从本地存储获取JWT令牌
      const config = {
        headers: {
          'Authorization': token // 将JWT令牌添加到请求头
        },
        params: {userName: this.userName}
      };
      const response = await axios.get(keystrokeUrl + '/get_mistake_data', config);
      console.log(response.data)
      this.finalText = response.data[0].finalText
      this.mistakeStr = response.data[0].mistakes;

      // 去除字符串中的外层括号以及引号
      const formattedData = this.mistakeStr.replace(/^\[|\]$/g, '').replace(/'/g, '"');

      // 使用正则表达式匹配每个元组字符串
      const regex = /\("(.*?)", "(.*?)", (\d+), (\d+)\)/g;
      let match;

      while ((match = regex.exec(formattedData)) !== null) {
        const [, mistake, correct, startIndex, endIndex] = match;
        this.mistakes.push({
          mistake,
          correct,
          startIndex: parseInt(startIndex),
          endIndex: parseInt(endIndex),
        });
      }

      // console.log(this.mistakes);  // 打印转换后的 JSON 数组
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }


  /**
   * 获取回放数据
   */
  async Replay() {
    await this.fetchEventLogs().then((replayData) => {
      this.replayData = replayData.eventLogs;
    });
    // this.startTime = 0;
    this.flag = 1;
    if ((window as any).emitter && this.flag == 1) {
      (window as any).emitter.on('Writing', async (data: any) => {
        await this.viewModelPlaBackHander(data);
      });
    }
    this.$watch('writingLength', (newValue: any, oldValue: any) => {
      if (newValue > oldValue) {
        this.typeSpeedSecond = newValue - oldValue;
      } else {
        this.typeSpeedSecond = 0;
      }
    }, {deep: true, immediate: true});
    // 计时器
    this.timing = setInterval(async () => {
      if (this.numSecond >= this.writingLength) {
        this.typeSpeedSecond = 0;
        // 若此刻的打字长度小于等于上一刻的打字长度，则这一秒内打字数为0
        this.lengthArray.push(0);
      } else {
        // 若此刻的打字长度大于上一刻的打字长度，则这一秒内打字数为此刻的打字长度减去上一刻的打字长度
        this.lengthArray.push(this.writingLength - this.numSecond);
      }
      // 如果allTime小于60，则this.typeSpeed为等比例的每分钟打字速度
      if (this.allTime <= 60) {
        // 对这一秒内的打字数求和，除以60，得到每秒的打字数
        let sum = 0;
        for (let i = 0; i < this.allTime; i++) {
          sum = sum + this.lengthArray[i];
        }
        // 每秒的打字数乘以60，得到每分钟的打字数, 首先判断this.allTime是否为0，若为0，则this.typeSpeed为0
        if (this.allTime == 0) {
          this.typeSpeed = 0;
        } else {
          this.typeSpeed = Math.round(sum / this.allTime * 60);
        }
      } else {
        // 对这一秒内的打字数求和，除以60，得到每秒的打字数
        let sum = 0;
        for (let i = this.allTime - 60; i < this.allTime; i++) {
          sum = sum + this.lengthArray[i];
        }
        this.typeSpeed = Math.round(sum);
      }
      this.speedArray.push(this.typeSpeed);
      this.timeArray.push(this.allTime);
      if (!this.chart) {
        this.chart = echarts.init(document.getElementById('chart'));
        await this.chart.setOption({
          title: {
            text: '写作速度',
          },
          tooltip: {
            trigger: 'axis',
          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: this.timeArray,
            axisLabel: {
              formatter: '{value} 秒',
            },
          },
          yAxis: {
            type: 'value',
            axisLabel: {
              formatter: '{value} 字/分钟',
            },
          },
          series: [
            {
              name: '速度',
              type: 'line',
              data: this.speedArray,
            },
          ],
        });
      } else {
        this.chart.setOption({
          xAxis: {
            data: this.timeArray,
          },
          series: [
            {
              name: '速度',
              data: this.speedArray,
            },
          ],
        });
      }
      this.allTime++;
      this.time = this.formateSeconds(this.allTime);
      // 记录此刻的打字长度
      this.numSecond = this.writingLength;
    }, 1000);
    if (this.replayData.length) {
      this.viewModelPlayback = await this.domRecord.startViewModelPlayback(this.replayData);
    }
  }

  getHighlightedText() {
    let result = this.finalText;
    this.mistakes.forEach(item => {
      const { startIndex, endIndex } = item;
      const highlightedText = this.finalText.slice(startIndex, endIndex).replace(/</g, '&lt;').replace(/>/g, '&gt;');
      if (this.showMistakeFlag) {
        result = result.replace(
            this.finalText.slice(startIndex, endIndex),
            `<span style="color: red;">${highlightedText}</span>`
        );
      } else {
        result = result.replace(
            this.finalText.slice(startIndex, endIndex),
            `<span style="color: black;">${highlightedText}</span>`
        );
      }
    });
    result = result.replace(/\n/g, '<br>'); // 将换行符替换为<br>标签
    return result;
  }


  showMistake () {
    this.showMistakeFlag = !this.showMistakeFlag;
    this.getHighlightedText();
    if(this.mistakes.length == 0) {
      this.$message({
        message: '暂未发现错误',
        type: 'info'
      });
    }
  }

  // 忽略el-table当前行的错误，保留其他行的错误不变
  ignoreMistake(currentIndex: number) {
    this.mistakes.splice(currentIndex, 1); // 删除当前行的数据
  }



  /**
   * 暂停回放
   */
  exitReplay() {
    this.flag = 0;
    clearInterval(this.timing);
    try {
      if (this.viewModelPlayback) {
        this.domRecord.stopViewModelPlayback(this.viewModelPlayback).then(() => {
          // 停止回放成功的回调逻辑
          console.log("Replay stopped successfully.");
        }).catch((error: any) => {
          // 停止回放失败的错误处理逻辑
          console.error("Failed to stop replay:", error);
        });
      }
    } catch (e) {
      console.error(e);
    }
  }

  returnBack() {
    this.$router.push('/admin'); // 跳转到"/admin"组件
  }

  //将秒转化为时分秒
  formateSeconds(endTime: any) {
    let secondTime = parseInt(endTime); //将传入的秒的值转化为Number
    let min = 0; // 初始化分
    let h = 0; // 初始化小时
    let result = '';
    if (secondTime > 60) {    //如果秒数大于60，
      min = parseInt(String(secondTime / 60)); //获取分钟，除以60取整数，得到整数分钟
      secondTime = parseInt(String(secondTime % 60)); //获取秒数，秒数取佘，得到整数秒数
      if (min > 60) {
        //如果分钟大于60，将分钟转换成小时
        h = parseInt(String(min / 60)); //获取小时，获取分钟除以60，得到整数小时
        min = parseInt(String(min % 60)); //获取小时后取佘的分，获取分钟除以60取佘的分
      }
    }
    if (h.toString().padStart(2, '0') == '00') {
      result = `${min.toString().padStart(2, '0')}分${secondTime.toString().padStart(2, '0')}秒`;
    } else {
      result = `${h.toString().padStart(2, '0')}时${min.toString().padStart(2, '0')}分${secondTime.toString().padStart(2, '0')}秒`;
    }

    return result;
  }

  viewModelPlaBackHander(data: any) {
    this.value = data.value;
    this.writingLength = data.ChineseLength as number;
  }

}
</script>

<style scoped>
.replay {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  width: 100%;
}

p {
  font-size: 16px;
  line-height: 1.5;
}

.writingReplay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  margin-left:0px;
  width: 60%;
}

.content {
  width: 80%;
  overflow: auto;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-start;
  margin-top: 30px;
  margin-right: -30px;
}

.header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px; /* 添加内边距 */
  font-family: Arial, sans-serif; /* 修改字体 */
  font-size: 16px; /* 修改字体大小 */
  color: #333; /* 修改字体颜色 */
  width: 70%;
}

.text-area {
  width: 100%;
  resize: none;
}

.playButton {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: center;
  margin-top: 20px;
  width: 80%;
}

.composition {
  position:relative;
  margin-top: 40px;
  margin-right: 30px;
  width: 50%;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

#chart{
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 50%;
  margin-left: 20px;
  padding: 20px;
  height: 400px; /* 设置合适的高度 */
}

.mistakeTable{
  width:240px;
  position:fixed;
  top:100px;
  right:730px;
  z-index:999;
}

.replayText{
  width: 100%;
  margin-right: 30px;
  font-size: 20px;
  border-radius: 4px;
  padding: 10px;
  white-space: pre-wrap;
  margin-top: 20px;
  font-family: KaiTi;
}

.replayContent{
  position: relative;
}

.username {
  position: absolute;
  top: 0;
  left: 0;
  font-size: 24px;
  color: #0088cc;
  font-weight: bold;
  padding: 10px;
  margin-bottom:50px;
}

.red-button {
  color: #ff5252;
  border: 1px solid #ff5252;
}

.red-button:hover {
  background-color: #ff5252;
  color: white;
}

.header-item {
  font-weight: bold;
}

.chart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background-color: #f9f9f9;
  margin-top: 50px;
  width: 80%;
  height: 350px; /* 设置合适的较大高度 */
  padding: 20px;
}

/* 其他代码未修改，请保持原样 */
</style>

