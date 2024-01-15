<template>
  <div class="username">用户名: {{ userName }}</div>
  <div class="download">
    <el-button type="primary" @click="downloadEventLogs()">
      下载写作过程数据
    </el-button>
  </div>
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

      <div class="playButton">
        <el-button type="primary" @click="Replay">开始回放</el-button>
        <!--          <el-button type="primary" @click="continueReplay" v-show="stopFlag">继续回放</el-button>-->
        <el-button type="danger" @click="exitReplay" style="margin-left: 40px;">暂停回放</el-button>
      </div>
    </div>
    <div class="header">
      <div class="header-item">写作总时间:{{ time }}</div>
      <div class="header-item">写作速度:{{ typeSpeed }}字/分钟、{{ typeSpeedSecond }}字/秒</div>
      <div class="header-item">写作总字数:{{ writingLength }}</div>
    </div>
  </div>
  <div class="replayContent">
    <div class="processReport">
      <h2>写作分析报告</h2>
      <div v-if="writingAnalysis">
        <p>IME输入次数: {{ writingAnalysis.ime_input_count }}</p>
        <p>IME平均输入长度: {{ writingAnalysis.average_ime_input_length.toFixed(2) }}</p>
        <p>修订总数: {{ writingAnalysis.revision_count }}</p>
        <p>每100字的平均修订次数: {{ writingAnalysis.average_revisions_per_100_characters.toFixed(2) }}</p>
        <p>每分钟的平均修订次数: {{ writingAnalysis.average_revisions_per_minute.toFixed(2) }}</p>
        <p>暂停总数: {{ writingAnalysis.pause_count }}</p>
        <p>平均暂停时长（秒）: {{ writingAnalysis.average_pause_duration.toFixed(2) }}</p>
        <p>平均暂停突发长度: {{ writingAnalysis.average_burst_length.toFixed(2) }}</p>
        <p>平均暂停突发持续时间（秒）: {{ writingAnalysis.average_burst_duration.toFixed(2) }}</p>
        <p>总过程时间: {{ writingAnalysis.total_process_time }}</p>
        <p>总暂停时间: {{ writingAnalysis.total_pausing_time }}</p>
        <p>总活跃写作时间: {{ writingAnalysis.total_active_writing_time }}</p>
        <p>思考与打字时间比: {{ writingAnalysis.thinking_typing_ratio.toFixed(2) }} %</p>
        <p>最终文本长度（字数）: {{ writingAnalysis.final_text_length }}</p>
        <p>写作过程产生的文本总长度（字数）: {{ writingAnalysis.generated_text_length }}</p>
        <p>每分钟字符数（作品）: {{ writingAnalysis.characters_per_minute_product.toFixed(2) }}</p>
        <p>每分钟字符数（过程）: {{ writingAnalysis.characters_per_minute_process.toFixed(2) }}</p>
        <p>作品/过程比例: {{ writingAnalysis.product_process_ratio.toFixed(2) *100 }} %</p>
      </div>
      <div v-else>
        <p>正在加载数据...</p>
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
import {ElRow, ElCol, ElMenu, ElMenuItem, ElButton, ElMessageBox} from "element-plus";
import {Message} from 'element-plus';
import Papa from "papaparse";

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
  userId: any;
  class_id: any;
  writingAnalysis: any;

  async created() {
    this.userName = this.$route.query.userName;
    this.userId = this.$route.query.userId;
    this.class_id = this.$route.query.class_id;
    this.fetchWritingAnalysis().then(data => {
      console.log(data)
      this.writingAnalysis = data; // 将获取到的数据保存到writingAnalysis中
    }).catch(error => {
      console.error('Error fetching writing analysis:', error);
      // 可以根据需要处理错误情况
    });
  }

  async fetchEventLogs() {
    try {
      const token = localStorage.getItem('adminToken'); // 从本地存储获取JWT令牌
      const config = {
        headers: {
          'Authorization': token // 将JWT令牌添加到请求头
        },
        params: {userId: this.userId, class_id: this.class_id}
      };
      const response = await axios.get(keystrokeUrl + '/get_event_logs', config);
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  async fetchWritingAnalysis() {
    try {
      const token = localStorage.getItem('adminToken');
      const config = {
        headers: { 'Authorization': token },
        params: { userId: this.userId, class_id: this.class_id }
      };
      const response = await axios.get(keystrokeUrl + '/analyze_writing', config);
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
          this.replayData = replayData.event_logs;
        });
        this.isLoading = false;
      }
      this.flag = 1;
      if (this.replayData.length) {
        this.viewModelPlayback = this.domRecord.startViewModelPlayback(this.userId, this.replayData);
      } else {
        clearInterval(this.timing);
      }
      if(!this.stopFlag) {
        if ((window as any).emitter && this.flag == 1) {
          (window as any).emitter.on(this.userId, async (data: any) => {
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

  async downloadEventLogs() {
    await ElMessageBox.confirm("是否下载击键记录数据?", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    })
        .then(async () => {
          if (!this.replayData) {
            this.isLoading = true;
            await this.fetchEventLogs().then((replayData) => {
              this.replayData = replayData.event_logs;
            });
            this.isLoading = false;
          }
          if (this.replayData) {
            const orderedEventLogs = this.replayData.map(log => ({
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
            tempLink.setAttribute("download", `${this.userId}_eventLogs.csv`);
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

  viewModelPlaBackHander(data: any) {
    this.value = data.value;
    this.writingLength = data.ChineseLength as number;
  }

}
</script>

<style scoped>
.processReport {
  width: 30%;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.5); /* 轻微的白色边框 */
  border-radius: 15px; /* 增加圆角 */
  background-color: rgba(2, 3, 5, 0.3); /* 半透明的深色背景 */
  backdrop-filter: blur(10px); /* 背景模糊效果 */
  color: #fff; /* 白色文字 */
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  line-height: 1.6;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); /* 添加阴影 */
  overflow: auto;
  margin-top: 40px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.processReport:hover {
  transform: translateY(-5px); /* 悬浮时轻微上移 */
  box-shadow: 0 6px 12px rgba(3, 3, 3, 0.5); /* 悬浮时增强阴影 */
}


.replay {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-around;
  width: 100%;
  margin-top: 20px;
}

p {
  font-size: 16px;
  line-height: 1.5;
  color: #444;
}

.writingReplay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background-color: #fff;
  margin: 0 20px;
  width: 80%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.content {
  width: 100%;
  overflow: auto;
  padding: 15px;
  background-color: #eaeaea;
  margin-top: 30px;
  border-radius: 5px;
}

.header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-around;
  background: linear-gradient(to right, #dda, #dddddd); /* 添加渐变背景 */
  padding: 20px;
  font-family: 'Roboto', sans-serif;
  font-size: 16px;
  color: #fff; /* 更改字体颜色以适应背景 */
  border-radius: 12px; /* 增加圆角 */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* 增加阴影以增强立体感 */
  width: 30%;
  margin-right: 30px;
  transition: all 0.3s ease;
  height: fit-content;
  margin-top: 60px;
}

.header-item {
  font-weight: bold;
  margin-bottom: 15px; /* 增加底部边距 */
  background: rgba(255, 255, 255, 0.1); /* 轻微背景色强调 */
  padding: 10px;
  border-radius: 8px; /* 圆角 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* 细微阴影 */
  transition: transform 0.3s ease;
}

.header-item:hover {
  transform: scale(1.05); /* 鼠标悬浮时轻微放大 */
  background: rgba(255, 255, 255, 0.2); /* 调整悬浮时的背景色 */
}
.text-area {
  width: 100%;
  resize: none;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ddd;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.playButton {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: center;
  margin-top: 20px;
  width: 80%;
}

#chart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 70%;
  margin-left: 20px;
  padding: 20px;
  height: 400px;
  background-color: #f2f2f2;
}

.replayContent {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin: 30px 0;
}

.username, .download {
  position: absolute;
  top: 10px;
  font-size: 24px;
  color: #0088cc;
  font-weight: bold;
}

.username {
  left: 20px;
}

.download {
  right: 20px;
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
  height: 350px;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
}

.loading-text {
  position: absolute;
  top: 70px;
  text-align: center;
  width: 100%;
  font-weight: bold;
  font-size: 16px;
  font-family: 'Roboto', sans-serif;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>

