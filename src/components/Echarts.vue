<template>
  <div>
    <div>
      <h2>条形图：不同隐含状态下键盘动作的概率分布</h2>
      <vue-echarts :options="barChartOptions" autoresize></vue-echarts>
    </div>
    <div>
      <h2>散点图：显示时间段内各状态的混合比例隐含变量φ</h2>
      <vue-echarts :options="scatterChartOptions" autoresize></vue-echarts>
    </div>
    <div>
      <h2>饼图：展示高斯混合模型聚类分析的结果</h2>
      <vue-echarts :options="pieChartOptions" autoresize></vue-echarts>
    </div>
    <div>
      <h2>折线图：展示不同学生之间的写作行为差异</h2>
      <vue-echarts :options="lineChartOptions" autoresize></vue-echarts>
    </div>
    <div>
      <h2>热力图：展示键盘动作在不同时间段和隐含状态下的分布</h2>
      <vue-echarts :options="heatmapChartOptions" autoresize></vue-echarts>
    </div>
  </div>
</template>

<script>
import VueECharts from 'vue-echarts';
import { generateData, barChart, scatterChart, pieChart, lineChart, heatmapChart } from '../utils/studentData';

export default {
  components: {
    'vue-echarts': VueECharts,
  },
  data() {
    const data = generateData(500);
    return {
      barChartOptions: barChart(data),
      scatterChartOptions: scatterChart(data),
      pieChartOptions: pieChart(data),
      lineChartOptions: lineChart(data),
      heatmapChartOptions: heatmapChart(data),
    };
  },
};
</script>