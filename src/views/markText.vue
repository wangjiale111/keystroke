<template>
  <el-button @click="getMark">点击显示作文评价</el-button>
  <div v-if="showFlag">
    <h2>作文原文：</h2>
    <p>{{ result.orgContent }}</p>

    <h2>得分：</h2>
    <p>总分：{{ result.scoreCollection.score }}</p>
    <p>观点得分：</p>
    <ul>
      <li>情感真诚度：{{ result.scoreCollection.perspectiveScore.sentimentSincerity }}</li>
      <li>文思流畅度：{{ result.scoreCollection.perspectiveScore.essayFluence }}</li>
      <li>结构严谨度：{{ result.scoreCollection.perspectiveScore.structureStrict }}</li>
      <li>主题明确度：{{ result.scoreCollection.perspectiveScore.themeExplicit }}</li>
      <li>优秀句型：{{ result.scoreCollection.perspectiveScore.goodSent }}</li>
      <li>满足要求度：{{ result.scoreCollection.perspectiveScore.satisfyRequirement }}</li>
    </ul>

    <h2>评语：</h2>
    <p>{{ result.commentCollection.comment }}</p>

    <h2>详细评价：</h2>
    <p v-for="(evaluation, index) in result.detailedEvaluation.sentenceEvaluation" :key="index">
      <span v-if="evaluation.start <= result.orgContent.length && evaluation.end <= result.orgContent.length">
        <span>{{ result.orgContent.slice(evaluation.start, evaluation.end) }}</span>
        <span>（类型：{{ evaluation.type }}）</span>
      </span>
    </p>

    <h2>短语评价：</h2>
    <ul>
      <li v-for="(phrase, index) in result.detailedEvaluation.phraseEvaluation" :key="index">
        <span v-if="phrase.start <= result.orgContent.length && phrase.end <= result.orgContent.length">
          <span>{{ result.orgContent.slice(phrase.start, phrase.end) }}</span>
          <span>（类型：{{ phrase.type }}，解释：{{ phrase.explanation }}）</span>
        </span>
      </li>
    </ul>

    <h2>纠错内容：</h2>
    <div v-for="(correction, index) in result.correctedContent" :key="index">
      <p>
        <span>{{ correction.orgSent }}</span>
        <span>（原句）</span>
      </p>
      <p>
        <span>{{ correction.corSent }}</span>
        <span>（修改后句子）</span>
      </p>
      <ul>
        <li v-for="(error, errorIndex) in correction.errorInfos" :key="errorIndex">
          <span>{{ error.orgChunk }}</span>
          <span>（原句片段）</span>
          <span>{{ error.corChunk }}</span>
          <span>（修改后片段）</span>
          <span>{{ error.errorType }}</span>
          <span>（错误类型）</span>
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
import {Options, Vue} from 'vue-class-component';
import axios from "axios";
import {keystrokeUrl} from "@/assets/config";



@Options({

})
export default class markText extends Vue {

  result = {}
  showFlag = false

  async created() {
    this.userName = this.$route.params.userName;
  }

  async getMark() {
    try {
      const token = localStorage.getItem('adminToken'); // 从本地存储获取JWT令牌
      const config = {
        headers: {
          'Authorization': token // 将JWT令牌添加到请求头
        },
        params: {userName: this.userName}
      };
      const response = await axios.get(keystrokeUrl + '/get_markText', config);
      console.log(response.data);
      console.log(typeof response.data)
      console.log(response.data.Result.scoreCollection.score)
      this.result = response.data.Result
    } catch (error) {
      console.error(error);
    }
    this.showFlag = true;
  }



}



</script>
<style>

</style>
