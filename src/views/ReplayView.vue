<template>
  <div class="record">
    <div class="writing">
      <textarea id="text" cols="100" rows="10" v-model="value" ></textarea>
      <br>
    </div>
  </div>
  <div class="play">
    <div>
      <button @click="Replay">开始回放</button>
      <button @click="exitReplay">退出回放</button>
    </div>
    <div class="index">写作速度:{{typeSpeed}}字/秒</div>
    <div class="index">写作总时间:{{time}}</div>
    <div class="index">写作总字数:{{writingLength}}</div>
  </div>
  <div id="chart" style="width: 100%;height: 300px;"></div>
</template>


<script lang="ts">
import {mixins, Options} from 'vue-class-component';
import ReplayViewModel from "@/views/ReplayViewModel";
import {DomEventRecord} from "@/record/DomEventRecord";
import index from "@/store"
import * as echarts from 'echarts';

@Options({

})

export default class ReplayView extends mixins(ReplayViewModel) {

  viewModelPlayback: any;
  domRecord = new DomEventRecord();
  replayData:any;
  value = '';
  typeNum = 0;
  typeLength = 0;
  startTime = 0;
  typeTime = 0;
  typeSpeed = 0;
  allTime = 0;
  time='00分00秒';
  writingLength=0;
  flag = 1;
  timing : any;
  chart: any;

  async created() {
    (window as any).playbackInProgress = false;
    // await this.getReplayData(this.time);
  }

  Replay(){
    this.replayData = index.state.data
    this.startTime = 0
    // 计时器
    clearInterval(this.timing);
    this.timing = setInterval(() => {
      if (this.flag == 1) {
        this.allTime ++
      }
      this.time = this.formateSeconds(this.allTime)
    }, 1000);
    // 每隔三秒算一次速度
    // this.typeNum = this.value.length
    // setInterval(() => {
    //     this.typeNum = this.value.length - this.typeNum
    //     this.typeSpeed =  Math.floor((this.typeNum / 3) * 100) / 100;
    // }, 3000)
    if ((window as any).emitter) {
      (window as any).emitter.on('Writing', (data: any) => {
        this.viewModelPlaBackHander(data);
      });
    }
    if (this.replayData.length) {
      this.viewModelPlayback = this.domRecord.startViewModelPlayback(this.replayData);
    }
    this.flag = 1;
  }

  /**
   * 退出回放
   */
  exitReplay() {
    this.flag = 0;
    try {
      this.domRecord.stopViewModelPlayback(this.viewModelPlayback).then();
    } catch (e) {
      console.error(e);
    }
  }

  //将秒转化为时分秒
  formateSeconds(endTime:any) {
    let secondTime = parseInt(endTime); //将传入的秒的值转化为Number
    let min = 0; // 初始化分
    let h = 0; // 初始化小时
    let result = "";
    if (secondTime > 60) {
      //如果秒数大于60，将秒数转换成整数
      min = parseInt(String(secondTime / 60)); //获取分钟，除以60取整数，得到整数分钟
      secondTime = parseInt(String(secondTime % 60)); //获取秒数，秒数取佘，得到整数秒数
      if (min > 60) {
        //如果分钟大于60，将分钟转换成小时
        h = parseInt(String(min / 60)); //获取小时，获取分钟除以60，得到整数小时
        min = parseInt(String(min % 60)); //获取小时后取佘的分，获取分钟除以60取佘的分
      }
    }
    if (h.toString().padStart(2, "0") == "00") {
      result = `${min.toString().padStart(2, "0")}分${secondTime
          .toString()
          .padStart(2, "0")}秒`;
    } else {
      result = `${h.toString().padStart(2, "0")}时${min
          .toString()
          .padStart(2, "0")}分${secondTime.toString().padStart(2, "0")}秒`;
    }

    return result;
  }

  viewModelPlaBackHander(data:any){
    // 把值赋给value双向绑定
    this.value = data.value;
    this.writingLength = this.value.length
    console.log(data);
    // 计算当前时间戳内打字数目
    if (data.value.length > this.typeLength) {
      this.typeNum = data.value.length - this.typeLength
      // console.log('打字数：' + this.typeNum)
    } else {
      this.typeNum = 0
    }
    // 时间戳的差作为时间
    this.typeTime = (data.timeStamp - this.startTime) / 1000
    // console.log(this.typeTime)
    // 计算速度
    if (this.typeNum === 0) {
      this.typeSpeed = 0
    } else {
      this.typeSpeed =  Math.floor((this.typeNum / this.typeTime) * 100) / 100;
    }
    // console.log('打字速度：' +this.typeSpeed)
    // 记录一下当前的时间戳和字符长度，以便下一次使用
    this.startTime = data.timeStamp
    this.typeLength = data.value.length

    // echarts
    if (!this.chart) {
      this.chart = echarts.init(document.getElementById('chart'));
      this.chart.setOption({
        title: {
          text: '打字速度'
        },
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: [this.allTime]
        },
        yAxis: {
          type: 'value',
          boundaryGap: [0, '100%']
        },
        series: [{
          name: '速度',
          type: 'line',
          data: [this.typeSpeed]
        }]
      });
    } else {
      this.chart.setOption({
        xAxis: {
          data: [this.allTime]
        },
        series: [{
          name: '速度',
          data: [this.typeSpeed]
        }]
      });
    }
  }

  // getReplayData(time: number) {
  //     this.replayData = index.state.data
  //     this.replayVMData = [];
  //     for (let i = 0; i < this.replayData.length; i++){
  //         const temp = {
  //             classKey: this.replayData[i].classKey,
  //             timeStamp: this.replayData[i].timeStamp,
  //             modelKey: this.replayData[i].modelKey,
  //             modelValue: this.replayData[i].value
  //         };
  //         this.replayVMData.push(temp);
  //         i += 1;
  //     }
  // }
}
</script>

<style scoped>
.play{
  height: 300px;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: center;
}
.index{
  margin-left: 60px;
}
</style>

