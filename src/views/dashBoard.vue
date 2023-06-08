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
        <div ref="barChart" style="width: 800px;height:500px;"></div>
      </div>
      <div>
        <h2>散点图：显示时间段内各状态的混合比例隐含变量φ</h2>
        <div ref="scatterChart" style="width: 800px;height:500px;"></div>
      </div>
      <div>
        <h2>饼图：展示高斯混合模型聚类分析的结果</h2>
        <div ref="pieChart" style="width: 800px;height:500px;"></div>
      </div>
      <div>
        <h2>折线图：展示不同学生之间的写作行为差异</h2>
        <div ref="lineChart" style="width: 800px;height:500px;"></div>
      </div>
      <div>
        <h2>热力图：展示键盘动作在不同时间段和隐含状态下的分布</h2>
        <div ref="heatmapChart" style="width: 800px;height:500px;"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import * as echarts from 'echarts'
import {Options, Vue} from 'vue-class-component';
import {generateData} from "@/utils/studentData";
import VueECharts from 'vue-echarts';

@Options({
  components: {
    'vue-echarts': VueECharts
  }
})

export default class dashBoard extends Vue {

  dataArray: any[] = [];

  mounted() {
    this.dataArray = generateData(500);
    this.drawTimeSeriesChart()
    this.drawTransitionGraphChart()
    this.drawProbabilityDistributionChart()
    this.drawClusteringResultChart()
    this.drawHeatMapChart()
    this.drawBarChart()
    this.drawScatterChart()
    this.drawPieChart()
    this.drawLineChart()
    this.drawHeatmapChart2()
  }


  drawTimeSeriesChart() {
    const chart = echarts.init(this.$refs.timeSeriesChart as HTMLElement)

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
    const chart = echarts.init(this.$refs.transitionGraphChart as HTMLElement)

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
          fontSize: 14,

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
    const chart = echarts.init(this.$refs.probabilityDistributionChart as HTMLElement)

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
    const chart = echarts.init(this.$refs.clusteringResultChart as HTMLElement)

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
          emphasis: {
            label: {
              show: true,
              formatter: function (params) {
                return params.data[0] + ', ' + params.data[1];
              },
              position: 'top',
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
          emphasis: {
            label: {
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

    chart.getZr().on('mousewheel', () => {
      //
    }, { passive: true })
  }

  drawHeatMapChart() {
    const chart = echarts.init(this.$refs.heatMapChart as HTMLElement)

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

  drawBarChart(){
    const chart = echarts.init(this.$refs.barChart as HTMLElement)
    const timeDurationData = this.dataArray.map(d => d.timeDuration);
    const colors = ['red', 'blue', 'green'];
    const actions = ['删除', '插入', '暂停'];
    const option = {
      color: colors,
      tooltip: {},
      legend: {
        data: actions,
      },
      xAxis: {
        type: 'category',
        axisLabel: {
          interval: 0,
          rotate: 30,
        },
        data: timeDurationData.reduce((arr, curr) => arr.concat(curr), []),
      },
      yAxis: {
        type: 'value',
        boundaryGap: [0, '100%'],
      },
      series: actions.map((a, j) => {
        return {
          name: a,
          type: 'bar',
          label: {
            show: true,
            position: 'top',
          },
          data: this.dataArray.map(d => d.actionProbabilities.map(p => p[j])).reduce((arr2, curr2) => arr2.concat(curr2), []),
        };
      }),
    };
    chart.setOption(option)
  }

  drawScatterChart() {
    const chart = echarts.init(this.$refs.scatterChart as HTMLElement)
    const option = {
      xAxis: {
        type: 'value',
      },
      yAxis: {
        type: 'value',
        boundaryGap: [0, '100%'],
      },
      series: [
        {
          symbolSize: 20,
          data: this.dataArray.map((d, i) => [i, d.meanLatentVariable]),
          type: 'scatter',
        },
      ],
    };
    console.log(option)
    chart.setOption(option)
  }

  drawPieChart(){
    const chart = echarts.init(this.$refs.pieChart as HTMLElement)
    const clusterCounts = Array.from({ length: 3 }, () => 0);
    this.dataArray.forEach(d => clusterCounts[d.cluster]++);
    const option = {
      tooltip: {
        trigger: 'item',
      },
      legend: {
        data: Array.from({ length: 3 }, (_, i) => `Cluster ${i + 1}`),
      },
      series: [
        {
          name: 'Clusters',
          type: 'pie',
          radius: '70%',
          data: clusterCounts.map((c, i) => ({
            value: c,
            name: `Cluster ${i + 1}`,
          })),
        },
      ],
    };
    chart.setOption(option)
  }

  drawLineChart(){
    const chart = echarts.init(this.$refs.lineChart as HTMLElement)
    const option = {
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: this.dataArray.map((_, i) => `Student ${i + 1}`),
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: [
        {
          type: 'category',
          boundaryGap: false,
          data: this.dataArray[0].timeDuration.map((_, i) => `Time ${i + 1}`),
        },
      ],
      yAxis: [
        {
          type: 'value',
        },
      ],
      series: this.dataArray.map((d, i) => {
        return {
          name: `Student ${i + 1}`,
          type: 'line',
          data: d.meanLatentVariable,
        };
      }),
    };
    chart.setOption(option)
  }

  drawHeatmapChart2(){
    const chart = echarts.init(this.$refs.heatmapChart as HTMLElement)
    const actions = ['删除', '插入', '暂停'];
    const option = {
      tooltip: {
        position: 'top',
      },
      animation: false,
      grid: {
        height: '50%',
        top: '10%',
      },
      xAxis: {
        type: 'category',
        data: this.dataArray[0].timeDuration.map((_, i) => `Time ${i + 1}`),
        splitArea: {
          show: true,
        },
      },
      yAxis: {
        type: 'category',
        data: actions,
        splitArea: {
          show: true,
        },
      },
      visualMap: {
        min: 0,
        max: 1,
        show: false,
      },
      series: [
        {
          name: 'Heatmap',
          type: 'heatmap',
          data: this.dataArray
              .map(d => d.actionProbabilities)
              .reduce((arr, curr) => arr.concat(curr), [])
              .map((ap, i) => [i % 5, Math.floor(i / 5), ap[0]]),
          itemStyle: {
            emphasis: {
              borderColor: '#333',
              borderWidth: 1,
            },
          },
          progressive: 1000,
          animation: false,
        },
      ],
    };
    chart.setOption(option)
  }
}
</script>
<style>
</style>

