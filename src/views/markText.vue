<template>
  <el-button @click="getMark" v-if="buttonFlag">点击调用有道API(一次一毛)</el-button>
  <div v-if="isLoading" class="loading-overlay">
    <div class="loading-spinner"></div>
  </div>
  <div class="replayContent">
    <div class="username">用户名: {{ userName }}</div>
    <div class="composition">
      <div v-html="getHighlightedText()" class="replayText"/>
      <div class="mistakeTable">
        <el-button @click="showMistake" class="red-button">错别字分析</el-button>
        <el-table :data="mistakes" v-show="showMistakeFlag" v-if="mistakes.length > 0">
          <el-table-column prop="mistake" label="错误" />
          <el-table-column prop="correct" label="建议" />
          <el-table-column label="操作" >
            <el-button @click="ignoreMistake(index)" style="width: 2em; height: 2em;">
              忽略
            </el-button>
          </el-table-column>
        </el-table>
        <div>
          <el-button @click="cancelMistake" v-show="showMistakeFlag && ignoreFlag">
            取消更改</el-button>
          <el-button @click="submitMistake" v-show="showMistakeFlag && ignoreFlag">
            确认更改</el-button>
        </div>
      </div>
    </div>
  </div>
  <div v-if="showFlag" style="margin-bottom: 200px;">

    <h2>得分：</h2>
    <p>总分：{{ apiResult.scoreCollection.score }}</p>
    <p>观点得分：</p>
    <ul>
      <li>情感真诚度：{{ apiResult.scoreCollection.perspectiveScore.sentimentSincerity }}</li>
      <li>文思流畅度：{{ apiResult.scoreCollection.perspectiveScore.essayFluence }}</li>
      <li>结构严谨度：{{ apiResult.scoreCollection.perspectiveScore.structureStrict }}</li>
      <li>主题明确度：{{ apiResult.scoreCollection.perspectiveScore.themeExplicit }}</li>
      <li>优秀句型：{{ apiResult.scoreCollection.perspectiveScore.goodSent }}</li>
      <li>满足要求度：{{ apiResult.scoreCollection.perspectiveScore.satisfyRequirement }}</li>
    </ul>

    <h2>评语：</h2>
    <p>{{ apiResult.commentCollection.comment }}</p>

    <h2>详细评价：</h2>
    <p v-for="(evaluation, index) in apiResult.detailedEvaluation.sentenceEvaluation" :key="index">
      <span v-if="evaluation.start <= apiResult.orgContent.length && evaluation.end <= apiResult.orgContent.length">
        <span>{{ apiResult.orgContent.slice(evaluation.start, evaluation.end) }}</span>
        <span>（类型：{{ evaluation.type }}）</span>
      </span>
    </p>

    <h2>短语评价：</h2>
    <ul>
      <li v-for="(phrase, index) in apiResult.detailedEvaluation.phraseEvaluation" :key="index">
        <span v-if="phrase.start <= apiResult.orgContent.length && phrase.end <= apiResult.orgContent.length">
          <span>{{ apiResult.orgContent.slice(phrase.start, phrase.end) }}</span>
          <span>（类型：{{ phrase.type }}，解释：{{ phrase.explanation }}）</span>
        </span>
      </li>
    </ul>

    <h2>纠错内容：</h2>
    <div v-for="(correction, index) in apiResult.correctedContent" :key="index" >
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
<script lang="ts" name="markText">
import {Options, Vue} from 'vue-class-component';
import axios from "axios";
import {keystrokeUrl} from "@/assets/config";
import {ElButton} from "element-plus";
import {Message} from 'element-plus';

@Options({
  components: {ElButton}
})
export default class markText extends Vue {

  apiResult = {}
  showFlag = false
  buttonFlag = false
  isLoading = true;

  flag = 1;
  userName: any;
  index = 0;
  result: any[] = [];
  finalText = '';
  mistakeStr: '';
  mistakes: any[] = [];
  showMistakeFlag = false;
  $message: Message;
  ignoreFlag = false;

  async created() {
    this.userName = this.$route.params.userName;
    await this.fetchMistake();
    await this.getMarkFlag()
    this.isLoading = false;
  }

  async fetchMistake() {
    try {
      const token = localStorage.getItem('adminToken'); // 从本地存储获取JWT令牌
      const config = {
        headers: {
          'Authorization': token // 将JWT令牌添加到请求头
        },
        params: {userName: this.userName}
      };
      const response = await axios.get(keystrokeUrl + '/get_mistake_data', config);
      console.log(response.data)
      // console.log(response.data)
      this.finalText = response.data[0].finalText
      this.mistakeStr = response.data[0].mistakes;
      // 去除字符串中的外层括号以及引号
      const formattedData = this.mistakeStr.replace(/^\[|\]$/g, '').replace(/'/g, '"');

      // 使用正则表达式匹配每个元组字符串
      const regex = /\("(.*?)", "(.*?)", (\d+), (\d+)\)/g;
      let match;

      while ((match = regex.exec(formattedData)) !== null) {
        const [, mistake, correct, startIndex, endIndex] = match;
        this.mistakes.push({
          mistake,
          correct,
          startIndex: parseInt(startIndex),
          endIndex: parseInt(endIndex),
        });
      }

      // console.log(this.mistakes);  // 打印转换后的 JSON 数组
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  getHighlightedText() {
    let result = this.finalText;
    this.mistakes.forEach(item => {
      const { startIndex, endIndex } = item;
      const highlightedText = this.finalText.slice(startIndex, endIndex).replace(/</g, '&lt;').replace(/>/g, '&gt;');
      if (this.showMistakeFlag) {
        result = result.replace(
            this.finalText.slice(startIndex, endIndex),
            `<span style="color: red;">${highlightedText}</span>`
        );
      } else {
        result = result.replace(
            this.finalText.slice(startIndex, endIndex),
            `<span style="color: black;">${highlightedText}</span>`
        );
      }
    });
    result = result.replace(/\n/g, '<br>'); // 将换行符替换为<br>标签
    return result;
  }


  showMistake () {
    this.showMistakeFlag = !this.showMistakeFlag;
    this.getHighlightedText();
    if(this.mistakes.length == 0) {
      this.$message({
        message: '暂未发现错误',
        type: 'info'
      });
    }
  }

  // 忽略el-table当前行的错误，保留其他行的错误不变
  ignoreMistake(currentIndex: number) {
    this.mistakes.splice(currentIndex, 1); // 删除当前行的数据
    this.ignoreFlag = true;
  }

// 向数据库提交mistakes：/api/update_mistakes
  async submitMistake() {
    this.ignoreFlag = false;
    try {
      const token = localStorage.getItem("adminToken"); // 从本地存储获取JWT令牌
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: token, // 将JWT令牌添加到请求头
        },
      };

      // 将mistakes从对象数组转换回原始字符串格式
      const mistakesString = `[${this.mistakes
          .map(({ mistake, correct, startIndex, endIndex }) => {
            return `("${mistake}", "${correct}", ${startIndex}, ${endIndex})`;
          })
          .join(",")}]`;

      // console.log(mistakesString);
      // 向后端发送用户名和mistakes更新请求
      const data = {
        userName: this.userName,
        mistakes: mistakesString,
      };
      const response = await axios.post(
          keystrokeUrl + "/update_mistakes",
          data,
          config
      );

      // 成功提示
      this.$message({
        message: '成功提交！',
        type: "success",
      });
    } catch (error) {
      console.error(error);
      // 错误提示
      this.$message({
        message: "提交失败!",
        type: "error",
      });
    }
  }

  // 取消所欲哦更改，把删除的el-table数据进行恢复
  async cancelMistake(){
    this.mistakes = [];
    await this.fetchMistake();
  }


  async getMarkFlag() {
    try {
      const token = localStorage.getItem('adminToken'); // 从本地存储获取JWT令牌
      const config = {
        headers: {
          'Authorization': token // 将JWT令牌添加到请求头
        },
        params: {userName: this.userName}
      };
      const response = await axios.get(keystrokeUrl + '/get_markTextFlag', config);
      console.log(response.data);
      if(response.data != '0') {
        this.apiResult = response.data.Result
        this.showFlag = true;
      } else {
        this.buttonFlag = true;
      }
      return response.data
    } catch (error) {
      console.error(error);
    }
    this.showFlag = true;
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
      // console.log(response.data);
      // console.log(typeof response.data)
      // console.log(response.data.Result.scoreCollection.score)
      this.apiResult = response.data.Result
    } catch (error) {
      console.error(error);
    }
    this.showFlag = true;
  }



}



</script>
<style scoped>

p {
  font-size: 16px;
  line-height: 1.5;
}

.composition {
  position:relative;
  margin-top: 60px;
  width: 70%; /* Changed to make it 70% of the page */
  border-radius: 8px;
  margin-bottom: 40px;
  margin-left: auto; /* These 2 lines are to center this div */
  margin-right: auto;
}

.mistakeTable{
  width:240px;
  position:fixed;
  top:120px;
  right:30px; /* Changed to make it on the rightmost */
  z-index:999;
}

.replayText{
  width: 100%;
  margin-right: 30px;
  font-size: 20px;
  border-radius: 4px;
  padding: 10px;
  white-space: pre-wrap;
  margin-top: 40px;
  margin-left: -80px;
  font-family: KaiTi;
  border: 1px solid #ebebeb;
}

.replayContent{
  position: relative;
}

.username {
  position: absolute;
  top: 0;
  left: 0;
  font-size: 24px;
  color: #0088cc;
  font-weight: bold;
  margin-top: -50px;
  margin-bottom: 30px;
}

.red-button {
  color: #ff5252;
  border: 1px solid #ff5252;
}

.red-button:hover {
  background-color: #ff5252;
  color: white;
}


.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

*{
  font-family: KaiTi;
}
</style>
