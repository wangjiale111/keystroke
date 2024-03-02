<template>
  <div class="page-container">
    <div class="username" style="z-index: 999">{{ studentName }}</div>
    <div class="download">
      <el-button type="primary" @click="downloadEventLogs()">
        下载写作过程数据
      </el-button>
    </div>
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <div class="loading-text">正在加载数据...</div>
    </div>

    <div class="row chart-row" style="margin-top: 30px; display: flex;">
      <div class="chart" id="chart-4-1-1">
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
      </div>
      <div class="header">
        <div class="header-item">写作总时间:{{ time }}</div>
        <div class="header-item">写作速度:{{ typeSpeed }}字/分钟、{{ typeSpeedSecond }}字/秒</div>
        <div class="header-item">写作总字数:{{ writingLength }}</div>
      </div>
    </div>

    <div class="row chart-row">
        <div id="chart" class="chart"></div>
      <div class="description" style="width: 25%">
      <!-- Description for 4-1-1 -->
      <p>该动态折线图以时间为横坐标，写作速度为纵坐标，随着回放的进行动态展示了写作过程中速度的波动与变化。图表揭示了写作节奏的具体模式，如速度的加快可能暗示了思维的流畅与信息的迅速转录，而速度的减慢则可能反映出深思或遇到难题。</p>
    </div>
    </div>

    <div class="row chart-row">
      <div class="chart" id="stacked-bar-chart" style="width: 40%;">
      </div>
      <div class="chart" id="pie-chart" style="width: 35%;">
      </div>
      <div class="description" style="width: 28%">
        <p>总过程时间展示了完成写作任务的全时段，总暂停时间显示了思考和计划的时间，而总活跃写作时间则是实际用于打字的时长。
          通过分析打字时间和思考时间的比例来评估学生在写作过程中的思考和打字速度。比如，一个高的打字/思考比率可能表示学生在写作时更多依赖于直觉，而较低的比率则可能意味着他们在写作时更加深思熟虑。</p>
      </div>
    </div>

    <div class="row chart-row">

      <div class="chart" id="bar-chart" style="width: 30%;">
      </div>
      <div class="chart" id="radar-chart" style="width: 45%;">
      </div>
      <div class="description" style="width: 28%">
        <p>提供了写作时认知努力的见解，报告了暂停的次数、平均暂停时长、暂停突发长度和持续时间。暂停行为分析可以揭示学生在写作过程中的思考模式。例如，频繁的短暂停可能表明快速思考或文本的微调，而较长的暂停可能表明对更复杂问题的深入思考。</p>
      </div>
    </div>

    <div class="row chart-row">
      <div class="chart" id="combo-chart" style="width: 45%;">
      </div>
      <div class="chart" id="gauge-chart" style="width: 30%;">
      </div>
      <div class="description" style="width: 28%">
        <p>
          提供了被删除和插入文本的程度的信息，包括总的修订次数、每100字和每分钟的平均修订次数，以及平均修订突发长度。
          通过分析修订行为，可以了解学生在写作过程中的修改习惯。较多的修订次数可能表明更高的自我批评能力或不断完善文本的愿望。
        </p>
      </div>
    </div>

    <div class="row chart-row">
      <div class="chart" id="radar-chart2" >
      </div>
      <div class="description">
      <p>
        描述了最终产品中的文本量与写作过程中产生的总文本量（包括复制的文本）的关系。还基于产品和过程数据计算了每分钟字符数。
        这一部分关注于写作过程中文本的量化分析，如学生实际写下了多少字，以及这些文字中有多少是最终作品的一部分。通过比较最终文本和过程中产生的总文本量，可以了解学生在写作中的编辑和修改程度。
      </p>
      </div>
    </div>




<!--    <div class="row text-row">-->
<!--      <div class="text-content">-->
<!--        <p>注意: 更多的说明性的文字内容...</p>-->
<!--      </div>-->
<!--    </div>-->
  </div>



<!--  <div class="replayContent">-->
<!--    <div class="processReport">-->
<!--      <h2>写作分析报告</h2>-->
<!--      <div v-if="writingAnalysis">-->
<!--&lt;!&ndash;        <p>IME输入次数: {{ writingAnalysis.ime_input_count }}</p>&ndash;&gt;-->
<!--&lt;!&ndash;        <p>IME平均输入长度: {{ writingAnalysis.average_ime_input_length.toFixed(2) }}</p>&ndash;&gt;-->


<!--&lt;!&ndash;        <p>修订总数: {{ writingAnalysis.revision_count }}</p>&ndash;&gt;-->
<!--&lt;!&ndash;        <p>每100字的平均修订次数: {{ writingAnalysis.average_revisions_per_100_characters.toFixed(2) }}</p>&ndash;&gt;-->
<!--&lt;!&ndash;        <p>每分钟的平均修订次数: {{ writingAnalysis.average_revisions_per_minute.toFixed(2) }}</p>&ndash;&gt;-->


<!--&lt;!&ndash;        <p>暂停总数: {{ writingAnalysis.pause_count }}</p>&ndash;&gt;-->
<!--&lt;!&ndash;        <p>平均暂停时长（秒）: {{ writingAnalysis.average_pause_duration.toFixed(2) }}</p>&ndash;&gt;-->
<!--&lt;!&ndash;        <p>平均暂停突发长度: {{ writingAnalysis.average_burst_length.toFixed(2) }}</p>&ndash;&gt;-->
<!--&lt;!&ndash;        <p>平均暂停突发持续时间（秒）: {{ writingAnalysis.average_burst_duration.toFixed(2) }}</p>&ndash;&gt;-->


<!--&lt;!&ndash;        <p>总过程时间: {{ writingAnalysis.total_process_time }}</p>&ndash;&gt;-->
<!--&lt;!&ndash;        <p>总暂停时间: {{ writingAnalysis.total_pausing_time }}</p>&ndash;&gt;-->
<!--&lt;!&ndash;        <p>总活跃写作时间: {{ writingAnalysis.total_active_writing_time }}</p>&ndash;&gt;-->
<!--&lt;!&ndash;        <p>思考与打字时间比: {{ writingAnalysis.thinking_typing_ratio.toFixed(2) }}</p>&ndash;&gt;-->


<!--&lt;!&ndash;        <p>最终文本长度（字数）: {{ writingAnalysis.final_text_length }}</p>&ndash;&gt;-->
<!--&lt;!&ndash;        <p>写作过程产生的文本总长度（字数）: {{ writingAnalysis.generated_text_length }}</p>&ndash;&gt;-->
<!--&lt;!&ndash;        <p>每分钟字符数（作品）: {{ writingAnalysis.characters_per_minute_product.toFixed(2) }}</p>&ndash;&gt;-->
<!--&lt;!&ndash;        <p>每分钟字符数（过程）: {{ writingAnalysis.characters_per_minute_process.toFixed(2) }}</p>&ndash;&gt;-->
<!--&lt;!&ndash;        <p>作品/过程比例: {{ writingAnalysis.product_process_ratio.toFixed(2) *100 }} %</p>&ndash;&gt;-->
<!--      </div>-->
<!--      <div v-else>-->
<!--        <p>正在加载数据...</p>-->
<!--      </div>-->
<!--    </div>-->

<!--  </div>-->
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
  writingAnalysis: any = null; // 给定一个初始值
  studentName = '';
  stackedBarChart: echarts.ECharts;
  pieChart: echarts.ECharts;
  barChart: echarts.ECharts;
  radarChart: echarts.ECharts;
  comboChart: echarts.ECharts;
  gaugeChart: echarts.ECharts;
  radarChart2: echarts.ECharts;

  async created() {
    this.userName = this.$route.query.userName;
    this.userId = this.$route.query.userId;
    this.class_id = this.$route.query.class_id;
    this.getStudentName()
    // await this.fetchEventLogs().then((replayData) => {
    //   this.replayData = replayData.event_logs;
    // });
    this.fetchWritingAnalysis().then(data => {
      this.writingAnalysis = data; // 将获取到的数据保存到writingAnalysis中
      console.log(this.writingAnalysis)
      this.$nextTick(() => {
        this.initializeChart();
        this.timeChart();
        this.generateBarChart();
        this.generateRadarChart();
        this.generateComboChart();
        this.generateGaugeChart();
        this.generateRadarChart2();
      });
    }).catch(error => {
      console.error('Error fetching writing analysis:', error);
      // 可以根据需要处理错误情况
    });
  }

  convertTimeToMinutes(timeStr: string): number {
    const parts = timeStr.split(':');
    const hours = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);
    const seconds = parseInt(parts[2]);
    const totalMinutes = hours * 60 + minutes + seconds / 60;
    console.log(parseFloat(totalMinutes.toFixed(2)))
    return parseFloat(totalMinutes.toFixed(2));
  }

  generateRadarChart2() {
    // 获取数据
    const finalTextLength = this.writingAnalysis.final_text_length;
    const generatedTextLength = this.writingAnalysis.generated_text_length;
    const charactersPerMinuteProduct = parseFloat(this.writingAnalysis.characters_per_minute_product.toFixed(2));
    const charactersPerMinuteProcess = parseFloat(this.writingAnalysis.characters_per_minute_process.toFixed(2));
    const productProcessRatio = parseFloat(this.writingAnalysis.product_process_ratio.toFixed(2))*100; // 转换为百分比

    // 初始化 ECharts 实例
    this.radarChart2 = echarts.init(document.getElementById('radar-chart2'));
    this.radarChart2.setOption({
      tooltip: {},
      // legend: {
      //   data: ['写作分析']
      // },
      radar: {
        name: {
          textStyle: {
            color: '#fff',
            backgroundColor: '#999',
            borderRadius: 3,
            padding: [3, 5]
          }
        },
        indicator: [
          { name: '最终文本长度', max: Math.max(finalTextLength, 1000) }, // 调整max值以适应数据
          { name: '写作过程文本长度', max: Math.max(generatedTextLength, 1000) }, // 调整max值以适应数据
          { name: '每分钟字符数（作品）', max: Math.max(charactersPerMinuteProduct, 100) }, // 调整max值以适应数据
          { name: '每分钟字符数（过程）', max: Math.max(charactersPerMinuteProcess, 100) }, // 调整max值以适应数据
          { name: '作品/过程比例 (%)', max: 100 } // 百分比
        ]
      },
      series: [{
        name: '写作分析',
        type: 'radar',
        data: [
          {
            value: [finalTextLength, generatedTextLength, charactersPerMinuteProduct, charactersPerMinuteProcess, productProcessRatio],
            name: '指标值'
          }
        ]
      }]
    });
  }


  generateComboChart() {
    // 获取数据
    const revisionCount = this.writingAnalysis.revision_count;
    const averageRevisionsPer100Words = parseFloat(this.writingAnalysis.average_revisions_per_100_characters.toFixed(2));
    const averageRevisionsPerMinute = parseFloat(this.writingAnalysis.average_revisions_per_minute.toFixed(2));

    // 初始化 ECharts 实例
    this.comboChart = echarts.init(document.getElementById('combo-chart'));
    this.comboChart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: '#999'
          }
        }
      },
      legend: {
        data: ['修订总数', '每100字的平均修订次数', '每分钟的平均修订次数']
      },
      xAxis: [
        {
          type: 'category',
          data: ['修订统计'],
          axisPointer: {
            type: 'shadow'
          }
        }
      ],
      yAxis: [
        {
          type: 'value',
          name: '修订次数',
          min: 0,
          position: 'left',
          axisLabel: {
            formatter: '{value}'
          }
        },
        {
          type: 'value',
          name: '平均次数/分钟',
          min: 0,
          position: 'right',
          axisLabel: {
            formatter: '{value}'
          }
        }
      ],
      series: [
        {
          name: '修订总数',
          type: 'bar',
          data: [revisionCount]
        },
        {
          name: '每100字的平均修订次数',
          type: 'bar',
          data: [averageRevisionsPer100Words]
        },
        {
          name: '每分钟的平均修订次数',
          type: 'line',
          yAxisIndex: 1,
          data: [averageRevisionsPerMinute]
        }
      ]
    });
  }

  generateGaugeChart() {
    // 获取数据
    const averageRevisionsPerMinute = parseFloat(this.writingAnalysis.average_revisions_per_minute.toFixed(2));

    // 初始化 ECharts 实例
    this.gaugeChart = echarts.init(document.getElementById('gauge-chart'));
    this.gaugeChart.setOption({
      tooltip: {
        formatter: '{a} <br/>{b} : {c}%'
      },
      series: [
        {
          name: '修订指标',
          type: 'gauge',
          detail: {formatter: '{value}'},
          data: [{value: averageRevisionsPerMinute, name: '每分钟平均修订次数'}]
        }
      ]
    });
  }


  generateBarChart() {
    // 获取数据
    const pauseCount = this.writingAnalysis.pause_count;
    const averagePauseDuration = this.writingAnalysis.average_pause_duration.toFixed(2);
    const averageBurstLength = this.writingAnalysis.average_burst_length.toFixed(2);
    const averageBurstDuration = this.writingAnalysis.average_burst_duration.toFixed(2);
    console.log(pauseCount, averagePauseDuration, averageBurstLength, averageBurstDuration)

    // 初始化 ECharts 实例
    this.barChart = echarts.init(document.getElementById('bar-chart'));
    this.barChart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: ['暂停总数', '平均暂停时长', '平均突发长度', '平均突发持续时间']
      },
      xAxis: {
        type: 'category',
        data: ['指标']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '暂停总数',
          type: 'bar',
          data: [pauseCount]
        },
        {
          name: '平均暂停时长',
          type: 'bar',
          data: [averagePauseDuration]
        },
        {
          name: '平均突发长度',
          type: 'bar',
          data: [averageBurstLength]
        },
        {
          name: '平均突发持续时间',
          type: 'bar',
          data: [averageBurstDuration]
        }
      ]
    });
  }

  generateRadarChart() {
    // 获取数据
    const pauseCount = this.writingAnalysis.pause_count;
    const averagePauseDuration = this.writingAnalysis.average_pause_duration.toFixed(2);
    const averageBurstLength = this.writingAnalysis.average_burst_length.toFixed(2);
    const averageBurstDuration = this.writingAnalysis.average_burst_duration.toFixed(2);
    console.log(pauseCount, averagePauseDuration, averageBurstLength, averageBurstDuration)

    // 初始化 ECharts 实例
    this.radarChart = echarts.init(document.getElementById('radar-chart'));
    this.radarChart.setOption({
      tooltip: {},
      radar: {
        // shape: 'circle',
        name: {
          textStyle: {
            color: '#fff',
            backgroundColor: '#999',
            borderRadius: 3,
            padding: [3, 5]
          },
          rotate: 90 // 旋转90度
        },
        indicator: [
          { name: '暂停总数', max: Math.max(pauseCount, 100)},
          { name: '平均暂停时长', max: Math.max(averagePauseDuration, 10)},
          { name: '平均突发长度', max: Math.max(averageBurstLength, 1000)},
          { name: '平均突发持续时间', max: Math.max(averageBurstDuration, 10)}
        ]
      },
      series: [{
        name: '写作分析',
        type: 'radar',
        data : [
          {
            value : [pauseCount, averagePauseDuration, averageBurstLength, averageBurstDuration],
            name : '实际值'
          }
        ]
      }]
    });
  }


  timeChart(){
    // Convert time strings to minutes
    const totalPausingTimeMinutes = this.convertTimeToMinutes(this.writingAnalysis.total_pausing_time);
    const totalActiveWritingTimeMinutes = this.convertTimeToMinutes(this.writingAnalysis.total_active_writing_time);
    const totalProcessTimeMinutes = this.convertTimeToMinutes(this.writingAnalysis.total_process_time);


    // 堆叠条形图
    this.stackedBarChart = echarts.init(document.getElementById('stacked-bar-chart'));
    this.stackedBarChart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '20%', // 或更多，根据需要调整
        right: '10%',
        bottom: '3%',
        containLabel: true
      },
      legend: {
        data: ['总暂停时间', '活跃写作时间','总过程时间']
      },
      xAxis: {
        type: 'value'
      },
      yAxis: {
        type: 'category',
        data: ['时间分布'],
        // 宽度
        axisLabel: {
          rotate: 90, // 如果需要，可以旋转标签
          interval: 0 // 显示所有标签
        }
      },
      series: [
        {
          name: '暂停时间',
          type: 'bar',
          stack: '总量',
          label: {
            show: true,
            position: 'insideRight'
          },
          data: [totalPausingTimeMinutes]
        },
        {
          name: '活跃写作时间',
          type: 'bar',
          stack: '总量',
          label: {
            show: true,
            position: 'insideRight'
          },
          data: [totalActiveWritingTimeMinutes]
        },
        {
          name: '总过程时间',
          type: 'bar',
          stack: '总量',
          label: {
            show: true,
            position: 'insideRight'
          },
          data: [totalProcessTimeMinutes]
        }
      ]
    });

    // 饼图
    this.pieChart = echarts.init(document.getElementById('pie-chart'));
    this.pieChart.setOption({
      tooltip: {
        trigger: 'item'
      },
      legend: {
        top: '5%',
        left: 'center'
      },
      series: [
        {
          name: '时间比例',
          type: 'pie',
          radius: '50%',
          data: [
            { value: totalPausingTimeMinutes, name: '思考时间' },
            { value: totalActiveWritingTimeMinutes, name: '打字时间' }
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    });
  }


  initializeChart() {
    // 初始化图表
      this.chart = echarts.init(document.getElementById('chart'));
    // console.log(this.chart)
      // 提供默认值以显示基本的坐标轴
      this.timeArray = this.timeArray.length ? this.timeArray : ['0'];
      this.speedArray = this.speedArray.length ? this.speedArray : [60];
      this.chart.setOption({
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

  }


  form = {
    userId: '',
  };

  getStudentName(){
    try {
      this.form.userId = this.$route.query.userId as string;
      axios
          .post(keystrokeUrl + '/getStudentInfo', this.form)
          .then((response) => {
            this.studentName = response.data.studentName;
          })
          .catch((error) => {
            console.error(error);
            this.$message({
              message: '信息获取失败，请检查网络连接',
              type: 'error',
            });
          });
    } catch (error) {
      this.$message({
        message: '信息获取失败，请联系管理员',
        type: 'error',
      });
      console.log(error);
    }
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
      if(!this.stopFlag && this.replayData == null){
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
        this.speedArray = [];
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
            // 每秒的打字数乘以60，得到每分钟的打字数,
            // 首先判断this.allTime是否为0，若为0，则this.typeSpeed为0
            if (this.allTime == 0) {
              this.typeSpeed = 0;
            } else {
              // this.typeSpeed = Math.round(sum / this.allTime * 60);
              this.typeSpeed = Math.round(sum);
            }
          } else {
            // 对此刻向前一分钟内的打字数量求和，再除以60，得到平均每秒的打字速度
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
              timeStamp: log.timeStamp || ""
            }));


            const csv = Papa.unparse(orderedEventLogs);
            const csvData = new Blob([csv], {type: "text/csv;charset=utf-8;"});
            const csvURL = window.URL.createObjectURL(csvData);
            const tempLink = document.createElement("a");
            tempLink.href = csvURL;
            tempLink.setAttribute("download", `${this.userName}.csv`);
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
/* 通用样式 */
.chart {
  height: 300px;
  margin: 10px;
  padding: 10px;
  flex-grow: 2; /* 保持原有的弹性布局属性 */
  flex-grow: 2; /* Chart takes more space */
  padding: 10px;
  width: 80%;
}

/* 其他样式保持不变 */


.page-container {
  padding: 20px 30px; /* 20px top and bottom, 30px left and right */
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 20px; /* 20px between rows */
}

.row {
  background-color: #e6f7ff; /* Pale blue background */
  display: flex; /* Enable flex layout for rows */
  align-items: stretch; /* Align the items vertically */
  gap: 20px; /* Gap between chart and description */
  margin-bottom: 20px;
}

.chart-row {
  background-color: #e6f7ff; /* Pale blue background */
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.text-row {
  padding: 10px;
}

.description {
  flex-grow: 1;
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center; /* This will vertically center the content */
  justify-content: center; /* This will horizontally center the content */
  margin: 10px 10px 10px 10px;
  font-family: 'KaiTi', 'STKaiti', serif; /* Kai font */
  text-align: justify; /* Justify text for better readability */
  width: 20%;
}

.description p {
  font-size: 20px;
  /* Rest of your styles */
}


.text-content {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
  height: 100%;
  /* Additional styling for text content as needed */
}

/* Responsive design adjustments */
@media (max-width: 768px) {
  .page-container {
    padding: 10px; /* Smaller padding on smaller screens */
  }

  .row {
    flex-direction: column; /* Stack them on top of each other on smaller screens */
    gap: 10px; /* Smaller gap on smaller screens */
  }

  .chart{
    width: 800%; /* Full width on smaller screens */
    flex-grow: 0; /* Disable flex-grow on smaller screens */
  }

  .description {
    width: 20%; /* Full width on smaller screens */
    flex-grow: 0; /* Disable flex-grow on smaller screens */
  }
}




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
  width: 90%;
}

.content {
  width: 100%;
  background-color: #eaeaea;
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
  margin-top: 10px;
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

