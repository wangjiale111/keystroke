<template>
  <div>
    <h1>数据可视化</h1>
    <div ref="timeSeriesChart" style="width: 700px;height:400px;"></div>
    <div ref="transitionGraphChart" style="width: 700px;height:400px;"></div>
    <div ref="probabilityDistributionChart" style="width: 700px;height:400px;"></div>
    <div ref="clusteringResultChart" style="width: 700px;height:400px;"></div>
    <div ref="heatMapChart" style="width: 800px;height:500px;"></div>
    <div>
      <div>
        <h2>条形图：不同隐含状态下键盘动作的概率分布</h2>
        <vue-echarts :options="barChartOptions" autoresize style="width: 800px;height:500px;"></vue-echarts>
      </div>
      <div>
        <h2>散点图：显示时间段内各状态的混合比例隐含变量φ</h2>
        <vue-echarts :options="scatterChartOptions" autoresize style="width: 800px;height:500px;"></vue-echarts>
      </div>
      <div>
        <h2>饼图：展示高斯混合模型聚类分析的结果</h2>
        <vue-echarts :options="pieChartOptions" autoresize style="width: 800px;height:500px;"></vue-echarts>
      </div>
      <div>
        <h2>折线图：展示不同学生之间的写作行为差异</h2>
        <vue-echarts :options="lineChartOptions" autoresize style="width: 800px;height:500px;"></vue-echarts>
      </div>
      <div>
        <h2>热力图：展示键盘动作在不同时间段和隐含状态下的分布</h2>
        <vue-echarts :options="heatmapChartOptions" autoresize style="width: 800px;height:500px;"></vue-echarts>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import * as echarts from 'echarts'
import {Options, Vue} from 'vue-class-component';
import {generateData} from "@/utils/studentData";
import {barChart, heatmapChart, lineChart, pieChart, scatterChart} from "@/utils/studentData";
import VueECharts from 'vue-echarts';


@Options({
  components: {
    'vue-echarts': VueECharts
  }
})
export default class dashBoard extends Vue {

  data = [];

  barChartOptions = {};
  scatterChartOptions = {};
  pieChartOptions = {};
  lineChartOptions = {};
  heatmapChartOptions = {};

  mounted() {
    this.data = generateData(500);

    this.barChartOptions = barChart(this.data);
    this.scatterChartOptions = scatterChart(this.data);
    this.pieChartOptions = pieChart(this.data);
    this.lineChartOptions = lineChart(this.data);
    this.heatmapChartOptions = heatmapChart(this.data);
    this.drawTimeSeriesChart()
    this.drawTransitionGraphChart()
    this.drawProbabilityDistributionChart()
    this.drawClusteringResultChart()
    this.drawHeatMapChart()
  }


  drawTimeSeriesChart() {
    const chart = echarts.init(this.$refs.timeSeriesChart)

    const option = {
      title: {
        text: '时间序列图',
      },
      tooltip: {},
      xAxis: {
        type: 'time',
        splitLine: {
          show: false
        }
      },
      yAxis: {
        type: 'category',
        data: ['删除', '插入', '暂停']
      },
      series: [{
        name: '键盘动作',
        type: 'scatter',
        data: (function () {
          const data = []
          const time = +new Date(2022, 9, 3, 9, 0, 0, 0)

          // 在此处插入随机数据
          for (let i = 0; i < 100; i++) {
            // 时间戳
            const randomTimestamp = time + Math.floor(Math.random() * 3600 * 1000)
            const randomAction = Math.floor(Math.random() * 3)
            data.push([randomTimestamp, randomAction])
          }
          return data
        })()
      }]
    }
    chart.setOption(option)
  }

  drawTransitionGraphChart() {
    const chart = echarts.init(this.$refs.transitionGraphChart)

    const option = {
      title: {
        text: '状态转换图',
      },
      tooltip: {},
      series: [{
        type: 'graph',
        layout: 'circular',
        symbolSize: 50,
        roam: true,
        draggable: true,
        edgeSymbol: ['circle', 'arrow'],
        edgeSymbolSize: [4, 10],
        label: {
          show: true,
          textStyle: {
            fontSize: 14,
          },
        },
        data: [
          {
            name: '文本生成',
            x: 300,
            y: 300,
          },
          {
            name: '编辑',
            x: 800,
            y: 300,
          },
          {
            name: '规划',
            x: 550,
            y: 50,
          },
        ],
        links: [{
          source: '文本生成',
          target: '编辑',
          value: 0.5,
        },
          {
            source: '编辑',
            target: '文本生成',
            value: 0.6,
          },
          {
            source: '文本生成',
            target: '规划',
            value: 0.2,
          },
          {
            source: '编辑',
            target: '规划',
            value: 0.1,
          },
          {
            source: '规划',
            target: '编辑',
            value: 0.8,
          },
        ],
        lineStyle: {
          opacity: 0.9,
          width: 2,
          curveness: 0,
        },
      }],
    }
    chart.setOption(option)
  }

  drawProbabilityDistributionChart() {
    const chart = echarts.init(this.$refs.probabilityDistributionChart)

    const option = {
      title: {
        text: '概率分布图',
      },
      tooltip: {},
      xAxis: {
        type: 'category',
        data: ['删除', '插入', '暂停']
      },
      yAxis: {
        type: 'value'
      },
      series: [{
        name: '概率',
        type: 'bar',
        barWidth: '40%',
        data: [
          Math.random().toFixed(2),
          Math.random().toFixed(2),
          Math.random().toFixed(2)
        ],
        itemStyle: {
          color(params) {
            const colorList = ['#90EE90', '#54AF78', '#53FF53']
            return colorList[params.dataIndex]
          }
        }
      }]
    }
    chart.setOption(option)
  }

  drawClusteringResultChart() {
    const chart = echarts.init(this.$refs.clusteringResultChart)

    const option = {
      title: {
        text: '聚类结果图',
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      tooltip: {},
      xAxis: {
        type: 'value',
        scale: true,
      },
      yAxis: {
        type: 'value',
        scale: true,
      },
      series: [
        {
          name: "cluster 1",
          data: Array.from({
            length: 20
          }, () => [Math.random() * 100, Math.random() * 100]),
          type: "scatter",
          symbolSize: 20,
          label: {
            emphasis: {
              show: true,
              formatter: function (param) {
                return param.data[0] + ', ' + param.data[1];
              },
              position: "top",
            },
          },
        },
        {
          name: "cluster 2",
          data: Array.from({
            length: 20
          }, () => [100 + Math.random() * 100, Math.random() * 100]),
          type: "scatter",
          symbolSize: 20,
          label: {
            emphasis: {
              show: true,
              formatter: function (param) {
                return param.data[0] + ', ' + param.data[1];
              },
              position: "top",
            },
          },
        },
      ],
    }
    chart.setOption(option)
  }

  drawHeatMapChart() {
    const chart = echarts.init(this.$refs.heatMapChart)

    const option = {
      title: {
        text: '热力图',
      },
      tooltip: {
        position: 'top',
        formatter: function (params) {
          return params.value[2] + '次'
        }
      },
      grid: {
        height: '50%',
        y: '10%'
      },
      xAxis: {
        type: 'category',
        data: ['删除', '插入', '暂停']
      },
      yAxis: {
        type: 'category',
        data: ['删除', '插入', '暂停']
      },
      visualMap: {
        min: 0,
        max: 100,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '15%'
      },
      series: [{
        name: '热力图',
        type: 'heatmap',
        data: [
          [0, 0, Math.random() * 100],
          [0, 1, Math.random() * 100],
          [0, 2, Math.random() * 100],
          [1, 0, Math.random() * 100],
          [1, 1, Math.random() * 100],
          [1, 2, Math.random() * 100],
          [2, 0, Math.random() * 100],
          [2, 1, Math.random() * 100],
          [2, 2, Math.random() * 100],
        ],
        label: {
          show: true,
          formatter: function (params) {
            return params.value[2] + '次'
          }
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
    }
    chart.setOption(option)
  }

}
</script>
<style>
</style>

