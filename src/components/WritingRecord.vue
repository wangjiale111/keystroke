<template>
  <div class="writing">
      <div class="header">
          <div>时间:{{ time }}</div>
          <div style="margin-left: 80px">字数:{{ wordNum }}</div>
      </div>
    <div class="text">
      <textarea cols="100" rows="10" v-model="value"></textarea>
    </div>
    <div class="button">
      <button @click="tostart">开始写作</button>
      <button @click="toStop" style="margin-left: 400px;">结束写作</button>
    </div>
  </div>
</template>

<script lang="ts">
import {mixins, Options} from 'vue-class-component';
import ReplayView from '@/views/ReplayView.vue';
import {Vue} from "vue-class-component";
import index from "@/store"
import {DomEventRecord} from "@/record/DomEventRecord";

export const CurriculumViewModelClasskey = {
    CurriculumDisconnectViewModel: 'CurriculumDisconnectViewModel',
    CooperativeViewModel: 'CooperativeViewModel',
    ScientificWritingCurriculumViewModel: 'ScientificWritingCurriculumViewModel',
    PersonalChoiceViewModel: 'PersonalChoiceViewModel',
    MaterialWithWritingViewModel:'MaterialWithWritingViewModel',
    WritingViewModel: 'WritingViewModel',
    ChoiceWithReasonViewModel: 'ChoiceWithReasonViewModel',
    IMViewModel:'IMViewModel'
};

export interface UserViewModel {
    classKey: string;
    modelKey: string;
    modelValue: any;
    // 时间戳
    timeStamp?: number;
    index?:number;
}

let recordData:any;

@Options({
components:{
  ReplayView
}
})
export default class WritingRecord extends mixins(Vue)  {

    domRecord: any;
    value = '';
    replayData: any[] = [];
    num2 = 0;
    time = '0分0秒';
    flag = false;
    wordNum = 0;

    /**
     * tostart  开始录制 1.计时器计算时间  2.监听输入框的值 3.调用recordUserViewModel方法 4.将数据存入replayData
     *
     */
    tostart(){
        console.log("record开始")
        // 计时器计算时间
        this.flag = false;
        this.value = '';
        let time = 0;
        const timer = setInterval(()=>{
            if(this.flag){
                clearInterval(timer);
            }
            time++;
            const min = Math.floor(time/60);
            const sec = time%60;
            this.time = `${min}分${sec}秒`;
        },1000)

        this.domRecord = new DomEventRecord();
        this.domRecord.startRecord((log: any) => {
            console.log(log)
        });
        this.$watch('value', (newValue: any,oldValue: any) => {
            const data :UserViewModel = {
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
     *
     */
    toStop(){
        console.log("点击提交，结束录制")
        this.flag = true;
        recordData =this.domRecord.stopRecord((log: any) => {
            console.log(log)
        });
        index.setState(JSON.parse(JSON.stringify(this.replayData)))
    }

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.text{
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

.header{
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center
}

.button{
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

.writing {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

</style>
