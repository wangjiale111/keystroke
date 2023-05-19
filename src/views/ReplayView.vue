<template>
    <div class="replay">
        <div class="writing">
            <div class="header">
                <div>写作速度:{{ typeSpeed }}字/秒</div>
                <div>写作总时间:{{ time }}</div>
                <div>写作总字数:{{ writingLength }}</div>
            </div>
            <el-input
                    type="textarea"
                    :rows="10"
                    v-model="value"
                    :disabled="true"
                    class="text-area"
            ></el-input>
            <div class="playButton">
                <el-button type="primary" @click="Replay">开始回放</el-button>
                <el-button type="danger" @click="exitReplay" style="margin-left: 80px;">暂停回放</el-button>
            </div>
            <div id="chart" style="width: 500px;height: 300px; margin-top: 50px;"></div>
        </div>
    </div>
</template>

<script lang="ts">
import {mixins, Options, Vue} from 'vue-class-component';
import {DomEventRecord} from '@/record/DomEventRecord';
import index from '@/store';
import * as echarts from 'echarts';

@Options({})
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
    allTime = 0;
    time = '00分00秒';
    writingLength = 0;
    flag = 1;
    timing: any;
    chart: any;
    timeArray: any[] = [];
    speedArray: any[] = [];

    /**
     * 生命周期 created
     *
     */
    async created() {
        (window as any).playbackInProgress = false;
        // await this.getReplayData(this.time);
    }

    /**
     * 获取回放数据
     */
    Replay() {
        this.replayData = index.state.data;
        this.startTime = 0;
        this.flag = 1;
        // 计时器
        this.timing = setInterval(() => {
            this.allTime++;
            this.time = this.formateSeconds(this.allTime);
        }, 1000);
        if ((window as any).emitter && this.flag == 1) {
            (window as any).emitter.on('Writing', (data: any) => {
                this.viewModelPlaBackHander(data);
            });
        }
        if (this.replayData.length) {
            this.viewModelPlayback = this.domRecord.startViewModelPlayback(this.replayData);
        }
    }

    /**
     * 暂停回放
     */
    exitReplay() {
        this.flag = 0;
        clearInterval(this.timing);
        try {
            this.domRecord.stopViewModelPlayback(this.viewModelPlayback).then();
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

    /**
     * 这个函数的功能如下：
     * 1. 把值赋给value双向绑定
     * 2. 计算当前时间戳内打字数目
     * 3. 时间戳的差作为时间
     * 4. 计算速度
     * @param data
     */
    viewModelPlaBackHander(data: any) {
        // 把值赋给value双向绑定
        this.value = data.value;
        this.writingLength = this.value.length;
        // 当data.value.length为0时，停止计时，保持当前allTime不变
        // 计算当前时间戳内打字数目
        if (data.value.length > this.typeLength) {
            this.typeNum = data.value.length - this.typeLength;
            // console.log('打字数：' + this.typeNum)
        } else {
            this.typeNum = 0;
        }
        // 时间戳的差作为时间
        this.typeTime = (data.timeStamp - this.startTime) / 1000;
        // console.log(this.typeTime)
        // 计算速度
        if (this.typeNum === 0) {
            this.typeSpeed = 0;
        } else {
            this.typeSpeed = Math.floor((this.typeNum / this.typeTime) * 100) / 100;
        }
        this.speedArray.push(this.typeSpeed);
        this.timeArray.push(this.allTime);
        // 记录一下当前的时间戳和字符长度，以便下一次使用
        this.startTime = data.timeStamp;
        this.typeLength = data.value.length;

        if (!this.chart) {
            this.chart = echarts.init(document.getElementById('chart'));
            this.chart.setOption({
                title: {
                    text: '打字速度',
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
                        formatter: '{value} 字/秒',
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
    }
}
</script>

<style scoped>
.replay {
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

.header {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    background-color: #f0f0f0; /* 添加背景色 */
    padding: 10px 20px; /* 添加内边距 */
    font-family: Arial, sans-serif; /* 修改字体 */
    font-size: 16px; /* 修改字体大小 */
    color: #333; /* 修改字体颜色 */
    width: 800px;
}

.text-area {
    width: 100%;
    resize: none;
}

.playButton {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: stretch;
    margin-top: 20px;
}

</style>

