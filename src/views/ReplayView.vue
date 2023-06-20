<template>
  <div class="replayContent">
    <div class="username">用户名: {{ userName }}</div>
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <div class="loading-text">正在加载数据...</div>
    </div>
    <div class="replay">
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
<!--          <el-button type="primary" @click="continueReplay" v-show="stopFlag">继续回放</el-button>-->
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
  finalText = '';
  mistakes: any[] = [];
  $message: Message;
  replayFlag = false;
  isLoading = false;
  stopFlag = false;
  viewModelPlaybackDone = false;

  /**
   * 生命周期 created
   */
  async created() {

    this.userName = this.$route.params.userName;
    // this.$watch(
    //     () => this.$route.params.userName, (newUserName, oldUserName) => {
    //       // 当userName变化时重新加载页面所有的数据
    //       console.log(`Username changed from ${oldUserName} to ${newUserName}`);
    //     },
    //     {immediate: true, deep: true}
    // );
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

  /**
   * 获取回放数据
   */
  async Replay() {
    // this.startTime = 0;
    if(this.replayFlag){
      this.$message({
        message: '回放正在进行！',
        type: 'warning'
      });
      return;
    } else {
      this.replayFlag = true;
      if(!this.stopFlag){
        this.isLoading = true;
        await this.fetchEventLogs().then((replayData) => {
          this.replayData = replayData.eventLogs;
        });
        this.isLoading = false;
      }
      this.flag = 1;
      if (this.replayData.length) {
        this.viewModelPlayback = this.domRecord.startViewModelPlayback(this.userName, this.replayData);
      } else {
        clearInterval(this.timing);
      }
      if(!this.stopFlag) {
        if ((window as any).emitter && this.flag == 1) {
          (window as any).emitter.on(this.userName, async (data: any) => {
            await this.viewModelPlaBackHander(data);
          });
        }
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
              // this.typeSpeed = Math.round(sum / this.allTime * 60);
              this.typeSpeed = Math.round(sum);
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
      } else{

        if ((window as any).emitter && this.flag == 1) {
          this.isLoading = true;
          (window as any).emitter.on(this.userName, async (data: any) => {
            this.viewModelPlaybackDone= true;
            this.viewModelPlaBackHander(data);
          });
          this.isLoading = false;
        }

        const checkPlaybackDoneIntervalId = setInterval(() => {
          // 检查处理器是否完成，如果完成，则清除interval并开始新的定时器
          if (this.viewModelPlaybackDone) {

            clearInterval(checkPlaybackDoneIntervalId);
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
                  // this.typeSpeed = Math.round(sum / this.allTime * 60);
                  this.typeSpeed = Math.round(sum);
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
          }
        }, 100);
      }


      this.$watch('writingLength', (newValue: any, oldValue: any) => {
        if (newValue > oldValue) {
          this.typeSpeedSecond = newValue - oldValue;
        } else {
          this.typeSpeedSecond = 0;
        }
      }, {deep: true, immediate: true});
      // 计时器

    }
  }

  /**
   * 继续回放
   */
  // continueReplay() {
  //   if(this.replayFlag){
  //     this.$message({
  //       message: '回放正在进行！',
  //       type: 'warning'
  //     });
  //     return;
  //   } else {
  //
  //   }
  // }

  /**
   * 暂停回放
   */
  exitReplay() {
    this.flag = 0;
    this.stopFlag = true;
    this.replayFlag = false;
    this.viewModelPlaybackDone = false;
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
  width: 80%;
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

#chart{
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 70%;
  margin-left: 20px;
  padding: 20px;
  height: 400px; /* 设置合适的高度 */
}

.replayContent{
  position: relative;
  margin-bottom: 200px;
}

.username {
  position: absolute;
  top: 0;
  left: 0;
  font-size: 24px;
  color: #0088cc;
  font-weight: bold;
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
  width: 70%;
  height: 350px; /* 设置合适的较大高度 */
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
  width: 150px;
  height: 150px;
  animation: spin 1s linear infinite;
}

.loading-text {
  position: absolute;
  top: 430px;
  text-align: center;
  width: 100%;
  font-weight: bold;
  font-size: 16px;
  font-family: '楷体';
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

