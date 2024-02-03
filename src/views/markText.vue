<template>
  <el-button @click="getMark" v-if="buttonFlag">有道智云分析</el-button>
  <div v-if="isLoading" class="loading-overlay">
    <div class="loading-spinner"></div>
  </div>
  <div class="replayContent">
    <div class="username">{{ studentName }}</div>
    <div class="composition">
      <div class="title" style="font-size: 30px;">作文题目：{{textTitle}}</div>
      <div class="title" style="font-size: 20px;margin-top: 20px;margin-left: -60px;">{{requirement}}</div>
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
    <div style="border: 1px solid #e1e1e1; padding: 20px; border-radius: 10px; font-family: Arial, sans-serif;display: flex;flex-direction: row;">
      <div class="leftContent">
        <div class="scoreHead">
          <div class="score">
            <h2 style="color: #666;">评分：</h2>
            <div class="score-circle">
              <span class="total-score">{{ apiResult.scoreCollection.score }}</span>
            </div>
          </div>

          <div class="detail">
            <ul>
              <li>
                情感真诚度：
                <div class="score-bar">
                  <div class="score-value sentimentSincerity" :style="{ width: apiResult.scoreCollection.perspectiveScore.sentimentSincerity*10 + '%' }">
                    {{ apiResult.scoreCollection.perspectiveScore.sentimentSincerity }}
                  </div>
                </div>
              </li>
              <li>
                文思流畅度：
                <div class="score-bar">
                  <div class="score-value essayFluence" :style="{ width: apiResult.scoreCollection.perspectiveScore.essayFluence*10 + '%' }">
                    {{ apiResult.scoreCollection.perspectiveScore.essayFluence }}
                  </div>
                </div>
              </li>
              <li>
                结构严谨度：
                <div class="score-bar">
                  <div class="score-value structureStrict" :style="{ width: apiResult.scoreCollection.perspectiveScore.structureStrict*10 + '%' }">
                    {{ apiResult.scoreCollection.perspectiveScore.structureStrict }}
                  </div>
                </div>
              </li>
              <li>
                主题明确度：
                <div class="score-bar">
                  <div class="score-value themeExplicit" :style="{ width: apiResult.scoreCollection.perspectiveScore.themeExplicit*10 + '%' }">
                    {{ apiResult.scoreCollection.perspectiveScore.themeExplicit }}
                  </div>
                </div>
              </li>
              <li>
                优秀句型：
                <div class="score-bar">
                  <div class="score-value goodSent" :style="{ width: apiResult.scoreCollection.perspectiveScore.goodSent*10 + '%' }">
                    {{ apiResult.scoreCollection.perspectiveScore.goodSent }}
                  </div>
                </div>
              </li>
              <li>
                满足要求度：
                <div class="score-bar">
                  <div class="score-value satisfyRequirement" :style="{ width: apiResult.scoreCollection.perspectiveScore.satisfyRequirement*10 + '%' }">
                    {{ apiResult.scoreCollection.perspectiveScore.satisfyRequirement }}
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div style="margin-bottom: 20px;">
          <h2 style="color: #666;">评语：</h2>
          <p style="background: #f1f1f1; padding: 10px; border-radius: 5px;">{{ apiResult.commentCollection.comment }}</p>
        </div>
        <div style="margin-bottom: 20px;">
          <h2 style="color: #666;">好词好句：</h2>
          <ul style="list-style: none; padding: 0;">
            <li v-for="(phrase, index) in apiResult.detailedEvaluation.phraseEvaluation" :key="index" style="background: #f1f1f1; padding: 10px; border-radius: 5px; margin-bottom: 10px;">
          <span v-if="phrase.start <= apiResult.orgContent.length && phrase.end <= apiResult.orgContent.length">
            <span>{{ apiResult.orgContent.slice(phrase.start, phrase.end) }}</span>
            <span>：{{ phrase.explanation }}</span>
          </span>
            </li>
          </ul>
          <div style="margin-bottom: 20px;">
            <p v-for="(evaluation, index) in apiResult.detailedEvaluation.sentenceEvaluation" :key="index" style="background: #f1f1f1; padding: 10px; border-radius: 5px; margin-bottom: 10px;">
        <span v-if="evaluation.start <= apiResult.orgContent.length && evaluation.end <= apiResult.orgContent.length">
          <span>{{ apiResult.orgContent.slice(evaluation.start, evaluation.end) }}</span>
        </span>
            </p>
          </div>
        </div>
        <div style="margin-bottom: 20px;">
          <h2 style="color: #666;">纠错：</h2>
          <div v-for="(correction, index) in apiResult.correctedContent" :key="index" style="background: #f1f1f1; padding: 10px; border-radius: 5px; margin-bottom: 10px;">
            <p>
              <span>原句：</span>
              <span>{{ correction.orgSent }}</span><br>
            </p>
            <p>
              <span>纠正：</span>
              <span>{{ correction.corSent }}</span><br>
            </p>
            <ul style="list-style: none; padding: 0;">
              <li v-for="(error, errorIndex) in correction.errorInfos" :key="errorIndex">
                <span>原句：</span>
                <span>{{ error.orgChunk }}</span><br>
                <span>纠正：</span>
                <span>{{ error.corChunk }}</span><br>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div class="rightContent">
        <div style="margin-bottom: 20px;">
          <h2 style="color: #666;">文章分析：</h2>
          <p v-html="formatText(apiData.guidance.analysis)"></p>
        </div>

        <div style="margin-bottom: 20px;">
          <h2 style="color: #666;">核心观点：</h2>
          <p v-html="formatText(apiData.guidance.corePoint)"></p>
        </div>

        <div style="margin-bottom: 20px;">
          <h2 style="color: #666;">素材：</h2>
          <p v-html="formatText(apiData.guidance.material)"></p>
        </div>

        <div style="margin-bottom: 20px;">
          <h2 style="color: #666;">段落分配：</h2>
          <p v-html="formatText(apiData.guidance.paraAlloc)"></p>
        </div>
      </div>
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
  textTitle: any;
  index = 0;
  result: any[] = [];
  finalText = '';
  mistakeStr: '';
  mistakes: any[] = [];
  showMistakeFlag = false;
  $message: Message;
  ignoreFlag = false;
  userId: any;
  class_id: any;
  apiData= {};
  requirement = ''
  studentName = '';

  async created() {
    this.userName = this.$route.query.userName;
    this.userId = this.$route.query.userId;
    this.class_id = this.$route.query.class_id;
    this.textTitle = this.$route.query.textTitle;
    await this.getStudentName();
    await this.fetchMistakes();
    await this.getMarkFlag()
    this.isLoading = false;
  }

  form = {
    userId: '',
  };

  getStudentName(){
    try {
      this.form.userId = this.$route.query.userId as string;
      axios
          .post(keystrokeUrl + '/getStudentInfo', this.form)
          .then((response) => {
            this.studentName = response.data.studentName;
          })
          .catch((error) => {
            console.error(error);
            this.$message({
              message: '信息获取失败，请检查网络连接',
              type: 'error',
            });
          });
    } catch (error) {
      this.$message({
        message: '信息获取失败，请联系管理员',
        type: 'error',
      });
      console.log(error);
    }
  }

  formatText(text) {
    return text.replace(/\n/g, '<br>');
  }

  async fetchMistake() {
    try {
      let token = localStorage.getItem('adminToken')
      if (!token) {
        token = localStorage.getItem('studentToken');
      }
      const config = {
        headers: {
          'Authorization': token // 将JWT令牌添加到请求头
        },
        params: {userId: this.userId, class_id: this.class_id}
      };
      const response = await axios.get(keystrokeUrl + '/get_mistake_data', config);
      // console.log(response.data)
      // console.log(response.data)
      this.finalText = response.data.finalText
      this.mistakeStr = response.data.mistakes;
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

  async fetchMistakes() {
    try {
      let token = localStorage.getItem('adminToken')
      if (!token) {
        token = localStorage.getItem('studentToken');
      } // 从本地存储获取JWT令牌
      const config = {
        headers: {
          'Authorization': token // 将JWT令牌添加到请求头
        },
        params: {userId: this.userId, class_id: this.class_id}
      };
      const response = await axios.get(keystrokeUrl + '/get_mistakes', config);
      // console.log(response.data)
      // console.log(response.data)
      this.finalText = response.data.finalText
      this.mistakeStr = response.data.mistakes;
      this.requirement = response.data.textRequirement;
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
      let token = localStorage.getItem('adminToken')
      if (!token) {
        token = localStorage.getItem('studentToken');
      } // 从本地存储获取JWT令牌
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
        userId: this.userId,
        class_id: this.class_id,
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
    await this.fetchMistakes();
  }


  async getMarkFlag() {
    try {
      let token = localStorage.getItem('adminToken')
      if (!token) {
        token = localStorage.getItem('studentToken');
      } // 从本地存储获取JWT令牌
      const config = {
        headers: {
          'Authorization': token // 将JWT令牌添加到请求头
        },
        params: {class_id: this.class_id, userId: this.userId}
      };
      const response = await axios.get(keystrokeUrl + '/get_markTextFlag', config);
      // console.log(response.data);
      if(response.data != 'None') {
        this.apiResult = response.data.Result
        this.apiData = response.data.data
        // console.log(this.apiData)
        console.log(this.apiResult)
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
    this.isLoading = true;
    try {
      let token = localStorage.getItem('adminToken')
      if (!token) {
        token = localStorage.getItem('studentToken');
      } // 从本地存储获取JWT令牌
      const config = {
        headers: {
          'Authorization': token // 将JWT令牌添加到请求头
        },
        params: {class_id: this.class_id, userId: this.userId, title: this.textTitle }
      };
      const response = await axios.get(keystrokeUrl + '/get_markText', config);
      console.log(response.data);
      await this.fetchMistake();
      this.apiResult = response.data.Result
      this.apiData = response.data.data
      console.log(this.apiData)
    } catch (error) {
      console.error(error);
    }
    this.showFlag = true;
    this.isLoading = false;
  }



}



</script>
<style scoped>
.scoreHead {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
}

.score {
  width: 40%;
  margin-top: -100px;
}

.score-circle {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: #e6e6ff;
  margin: 20px auto;
}

.total-score {
  font-size: 2em;
  color: #0000ff;
}

.detail {
  width: 50%;
  padding-left: 20px;
}

.detail ul {
  margin: 0;
  padding: 0;
}

.detail li {
  margin-bottom: 10px;
}

.score-bar {
  height: 20px;
  background-color: #d3d3d3;
  border-radius: 5px;
}

.score-value {
  height: 100%;
  border-radius: 5px;
  color: white;
  text-align: right;
  padding-right: 5px;
}

/* 为每个指标设定不同的颜色 */
.sentimentSincerity { background-color: #ff6666; }
.essayFluence { background-color: #ffcc66; }
.structureStrict { background-color: #66ccff; }
.themeExplicit { background-color: #66ff66; }
.goodSent { background-color: #cc66ff; }
.satisfyRequirement { background-color: #66cccc; }


.leftContent{
  width: 40%;
  margin: 0 10px 0 10px;
}

.rightContent{
  width: 60%;
  margin: 0 10px 0 10px;
}
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

.essay-correction {
  border: 1px solid #e1e1e1;
  padding: 20px;
  border-radius: 10px;
  font-family: Arial, sans-serif;
  background-color: #fff;
}

.section h2 {
  color: #666;
  margin-bottom: 10px;
}

.section p, .section ul {
  background: #f1f1f1;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 10px;
}

.section ul {
  list-style: none;
  padding: 0;
}

.section li {
  margin-bottom: 5px;
}

.section li:last-child {
  margin-bottom: 0;
}

/* You can add this class to each section */
.section-title {
  color: #666;
  margin-bottom: 10px;
}

/* You can add this class to each paragraph within sections */
.section-content {
  background: #f1f1f1;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 10px;
}

/* You can add this class to each list within sections */
.section-list {
  list-style: none;
  padding: 0;
}

.section-list li {
  background: #f1f1f1;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 10px;
}

/* If you want to target the correction list specifically */
.correction-list li {
  background: none; /* or any other style you wish */
}


*{
  font-family: KaiTi;
}
</style>
