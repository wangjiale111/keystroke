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
</template>

<script lang="ts">
import {mixins, Options} from 'vue-class-component';
import ReplayViewModel from "@/views/ReplayViewModel";

@Options({

})

export default class ReplayView extends mixins(ReplayViewModel) {}
</script>

<style scoped>
.play{
  height: 300px;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: flex-end;
}
.index{
  margin-left: 60px;
}
</style>
