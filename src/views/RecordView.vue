<template>
    <div class="record">
      <div class="admin-login">
        <el-button class="admin-icon" @click="showLoginDialog" v-show="showRecord">
          管理员登录
        </el-button>
      </div>
      <div class="writing">
            <div class="title" v-show="!showForm">
                <span>名校生涯后的孔乙己困境：自我成长与社会期待的矛盾</span>
            </div>
            <div class="header" v-show="!showForm">
                <div>时间:{{ timeFormat }}</div>
                <div style="margin-left: 80px">字数:{{ wordNum }}</div>
            </div>
            <div class="content" >
                <div class="form" v-show="showForm">
                    <h3>调查问卷</h3>
                    <el-form ref="myForm"
                             :model="form"
                             label-width="120px"
                             style="margin-top: 10px"
                             :rules="formRules">
                        <el-form-item label="用户名" prop="userName">
                            <el-input
                                v-model="form.userName"
                                placeholder="请输入用户名"
                                :disabled="disable3"
                            ></el-input>
                        </el-form-item>
                        <el-form-item label="性别" prop="gender">
                            <el-select v-model="form.gender" placeholder="请选择性别" :disabled="disable3">
                                <el-option label="男" value="male"></el-option>
                                <el-option label="女" value="female"></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="年龄" prop="age">
                            <el-input
                                v-model="form.age"
                                placeholder="请输入年龄"
                                :disabled="disable3"
                                type="number"
                                min="16"
                            ></el-input>
                        </el-form-item>
                        <el-form-item label="写作过程回顾" prop="writingProblem">
                            <el-input
                                type="textarea"
                                v-model="form.writingProblem"
                                placeholder="请回顾你的整个写作过程"
                                :disabled="disable3"
                            ></el-input>
                        </el-form-item>
                        <el-form-item label="写作水平自评" prop="writingLevel">
                          <el-input
                              v-model="form.writingLevel"
                              placeholder="请进行分数自评(0-10分)"
                              :disabled="disable3"
                              type="number"
                              min="0"
                              max="10"
                          ></el-input>
                        </el-form-item>
                    </el-form>
                </div>
                <div class="button" v-show="showForm">
                    <el-button type="primary" @click="confirmSubmit" :disabled="disable3">提交调查问卷</el-button>
                </div>
              <div class="recordText">
                <el-input
                    type="textarea"
                    :rows="13"
                    v-model="value"
                    :disabled="disable"
                    @input="handleInput"
                    @keydown="handleKeyDown"
                    v-show="showWriting"
                    @paste="handlePaste"
                    style="width: 100%; font-size: 10px; border: 1px solid #ccc; border-radius: 4px; padding: 10px;"
                ></el-input>
              </div>
            </div>
            <div class="button">
                <el-button type="primary" @click="confirmStartWriting" v-show="showStart">开始写作</el-button>
                <el-button type="danger" @click="confirmEndWriting" style="margin-left: 80px;" :disabled="disable4">
                    结束写作
                </el-button>
            </div>
        </div>
      <LoginDialog v-if="showLogin" @close="closeLoginDialog" @login="handleLogin" />
    </div>
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component';
import ReplayView from '@/views/ReplayView.vue';
import {DomEventRecord} from "@/record/DomEventRecord";
// import Papa from "papaparse";
import {ElMessage, ElMessageBox, ElForm} from 'element-plus';
import {Message} from 'element-plus';
import {FormRules} from "element-plus/lib/components";
import {keystrokeUrl} from "@/assets/config";
import axios from "axios";
import LoginDialog from "@/components/LoginDialog.vue";
import { AppViewModel } from "@/AppViewModel";


let recordData: any;

@Options({
    components: {
        ReplayView,LoginDialog
    }
})
export default class WritingRecord extends Vue {

    domRecord: any;
    value = '';
    replayData: any[] = [];
    // 设置时间
    timeFormat = '20分00秒';
    flag = false;
    wordNum = 0;
    disable = true;
    // 设置时间,与timeFormat同步
    time = 1200;
    writingData: any[] = [];
    form = {
        userName: '',
        gender: '',
        age: '',
        writingProblem: '',
        writingLevel: null
    };
    disable3 = false
    disable4 = false
    $message: Message;
    formRules = {
        userName: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
        age: [
            { required: true, message: '请输入年龄', trigger: 'blur' }
        ],
        writingProblem: [{ required: true, message: '请输入写作时会遇到的问题', trigger: 'blur' }],
        writingLevel: [{ required: true, message: '请进行写作水平自评', trigger: 'change' }]
    };
    showWriting = true;
    showStart = true;
    showForm = false;

  showLogin = false; // 控制登录弹窗显示/隐藏的状态
  showRecord = true;


  mounted() {
    this.showRecord = true;
  }

  showLoginDialog(): void {
    this.showLogin = true; // 显示登录弹窗
  }

  closeLoginDialog(): void {
    this.showLogin = false; // 关闭登录弹窗
  }

  async handleLogin(loginFlag: string): Promise<void> {
    if (loginFlag) {
      this.$router.push({ name: "user" }); // 修改为跳转到默认子路由
    }
  }

    /**
     * toStart  开始录制 1.计时器计算时间  2.监听输入框的值 3.调用recordUserViewModel方法
     */
    toStart() {
        console.log("record开始")
        this.disable = false;
        this.showStart = false;
        // 计时器计算时间
        this.flag = false;
        this.value = '';
        const timer = setInterval(() => {
            if (this.flag || this.time <= 0) {
                clearInterval(timer);
                if (this.time <= 0) {
                    this.time = 0;
                    ElMessageBox.alert("写作时间已到！", "提示", {
                        confirmButtonText: "确定",
                        type: "warning",
                        callback: () => {
                            this.showWriting = false;
                            this.toStop();
                        }
                    });
                }
            } else {
                this.time--;
                const min = Math.floor(this.time / 60);
                const sec = this.time % 60;
                this.timeFormat = `${min}分${sec}秒`;
            }
        }, 1000);

        this.domRecord = new DomEventRecord();
        this.domRecord.startRecord((log: any) => {
            this.writingData.push(log);
            // console.log(log);
        });
        this.$watch('value', (newValue: any, oldValue: any) => {
            // const data: UserViewModel = {
            //     classKey: 'writing',
            //     text: newValue,
            //     timeStamp: 0
            // };
            // const temp = this.domRecord.recordUserViewModel(data, 0, 1);
            // this.replayData.push(temp);
            if (newValue !== null) {
                // console.log(newValue.length);
                this.wordNum = newValue.length;
            }
        }, {deep: true, immediate: true});
    }

    confirmSubmit () {
      (this.$refs.myForm as typeof ElForm).validate((valid: any) => {
        if (valid) {
          ElMessageBox.confirm('提交后不可更改，是否提交？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            this.disable3 = true;
            // 提交所有数据
            try {
              // 将用户事件日志发送给后端保存到数据库
              axios
                  .post(keystrokeUrl + '/save_event_logs', {
                    userName: this.form.userName,
                    eventLogs: this.writingData,
                    gender: this.form.gender,  // 添加调查问卷相关字段
                    writingProblem: this.form.writingProblem,
                    age: this.form.age,
                    writingLevel: this.form.writingLevel
                  })
                  .then(response => {
                    // console.log(response.data);
                    this.disable4 = true;

                    this.$message({
                      message: '提交成功',
                      type: 'success'
                    });
                  })
                  .catch(error => {
                    console.error(error);
                    this.$message({
                      message: '提交失败，请检查网络连接',
                      type: 'error'
                    });
                  });
            } catch (error) {
              this.$message({
                message: '提交失败，请联系管理员',
                type: 'error'
              });
              console.log(error);
            }
          }).catch(() => {
            // 取消提交
            ElMessage.info('已取消提交');
          });
        } else {
          return false;
        }
        });
    }

    confirmStartWriting() {
        ElMessageBox.confirm("是否开始写作?", "提示", {
            confirmButtonText: "开始",
            cancelButtonText: "取消",
            type: "warning"
        })
            .then(() => {
                this.toStart();
            })
            .catch(() => {
                // 取消开始写作
            });
    }

    confirmEndWriting() {
        ElMessageBox.confirm("是否结束写作?", "提示", {
            confirmButtonText: "结束",
            cancelButtonText: "取消",
            type: "warning"
        })
            .then(() => {
                this.toStop();
            })
            .catch(() => {
                // 取消结束写作
            });
    }

    /**
     * toStop  结束录制
     */
    toStop() {
        console.log("点击提交，结束录制");
        this.disable = true;
        this.flag = true;
        recordData = this.domRecord.stopRecord((log: any) => {
          console.log(log);
      });
        this.showForm = true;
    }


    /**
     * handleInput  监听输入框的值
     */
    handleInput() {
        // console.log()
    }


    /**
     * handleKeyDown  监听按键Tab
     */
    handleKeyDown(event) {
        if (event.key === 'Tab') {
            event.preventDefault(); // 阻止默认的焦点切换行为
            const inputValue = this.value;
            const tabCharacter = '\t';
            this.value = inputValue + tabCharacter;
        }
    }

  handlePaste(event) {
    event.preventDefault(); // 阻止默认粘贴行为
  }

}
</script>

<style scoped>
.content {
    width: 80%;
    overflow: auto;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
}

.header {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    padding: 10px 20px; /* 添加内边距 */
    font-family: Arial, sans-serif; /* 修改字体 */
    font-size: 16px; /* 修改字体大小 */
    color: #333; /* 修改字体颜色 */
    width: 80%;
}

.title {
    margin-bottom: 30px;
    font-size: 20px;
}

.button {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    margin-top: 10px;
    margin-bottom: 20px;
}

.record {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    width: 100%;
    height: 100%;
}

.writing {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
    border-radius: 8px;
    width: 100%;
    height: 100%;
    margin: 0 auto;
}

.admin-login {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  margin-right: 250px;
}

.admin-login a {
  display: flex;
  align-items: center;
  color: #2c3e50;
  text-decoration: none;
  margin-left: 10px;
}

.admin-icon {
  position: absolute;
  top: 10px;
  right: 0;
  z-index: 999;
}

.recordText{
  width: 50%;
  margin: 0 auto;
}
</style>



