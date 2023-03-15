<template>
  <div class="writing">
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
import WritingRecordViewModel from "@/components/WritingRecordViewModel";
import ReplayView from '@/views/ReplayView.vue';

@Options({
components:{
  ReplayView
}
})
export default class WritingRecord extends mixins(WritingRecordViewModel)  {
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

* {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  color: #2c3e50;
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
  align-items: stretch;
  justify-content: flex-start;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>
