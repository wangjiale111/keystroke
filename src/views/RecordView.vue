<template>
    <div class="record">
        <div class="writing">
            <div class="title">
                <span>题目：作文题目</span>
            </div>
            <div class="header">
                <div>时间:{{ timeFormat }}</div>
                <div style="margin-left: 80px">字数:{{ wordNum }}</div>
            </div>
            <div class="content">
                <h3>调查问卷</h3>
                <el-form ref="myForm"
                         :model="form"
                         label-width="120px"
                         style="margin-top: 10px"
                         :rules="formRules">
                    <el-form-item label="用户名" prop="userName">
                        <el-input
                                v-model="form.userName"
                                placeholder="请输入用户名："
                                :disabled="disable3"
                                @input="checkUserName"
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
                    <el-form-item label="写作困难" prop="writingProblem">
                        <el-input
                                v-model="form.writingProblem"
                                placeholder="请描述你在写作时会遇到的困难"
                                :disabled="disable3"
                        ></el-input>
                    </el-form-item>
                    <el-form-item label="写作水平自评" prop="writingLevel">
                        <el-rate v-model="form.writingLevel" :disabled="disable3"></el-rate>
                    </el-form-item>
                </el-form>
                <div class="button">
                    <el-button type="primary" @click="confirmSubmit" :disabled="disable3">提交调查问卷</el-button>
                </div>
                <el-input
                        type="textarea"
                        :rows="10"
                        v-model="value"
                        :disabled="disable"
                        @input="handleInput"
                        @keydown="handleKeyDown"
                ></el-input>
            </div>
            <div class="button">
                <el-button type="primary" @click="confirmStartWriting" :disabled="disable2">开始写作</el-button>
                <el-button type="danger" @click="confirmEndWriting" style="margin-left: 80px;" :disabled="disable4">
                    结束写作
                </el-button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component';
import ReplayView from '@/views/ReplayView.vue';
import {DomEventRecord} from "@/record/DomEventRecord";
// import Papa from "papaparse";
import {ElMessage, ElMessageBox, ElForm} from 'element-plus';
import axios from "axios";
import {Message} from 'element-plus';
import {FormRules} from "element-plus/lib/components";

let recordData: any;

@Options({
    components: {
        ReplayView
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
    disable2 = true;
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


    /**
     * toStart  开始录制 1.计时器计算时间  2.监听输入框的值 3.调用recordUserViewModel方法
     */
    toStart() {
        console.log("record开始")
        this.disable = false;
        this.disable2 = true;
        this.disable3 = true;
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
            // 提交调查问卷
            ElMessage.success('已成功提交，请点击开始写作');
            this.disable2 = false;
            this.disable3 = true;
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
     * toStop  结束录制 1.调用stopRecord方法 2.将数据存入recordData
     */
    toStop() {
        console.log("点击提交，结束录制");
        this.disable = true;
        this.flag = true;
        recordData = this.domRecord.stopRecord((log: any) => {
            console.log(log);
        });
        try {
            // 将用户事件日志发送给后端保存到数据库
            axios
                .post('http://127.0.0.1:5000/api/save_event_logs', {
                    userName: this.form.userName,
                    eventLogs: this.writingData,
                    gender: this.form.gender,  // 添加调查问卷相关字段
                    writingProblem: this.form.writingProblem,
                    age: this.form.age,
                    writingLevel: this.form.writingLevel
                })
                .then(response => {
                    console.log(response.data);
                    this.disable4 = true;
                    console.log(this.disable4);
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
                message: '提交失败，请检查网络连接',
                type: 'error'
            });
            console.log(error);
        }
    }


    /**
     * handleInput  监听输入框的值
     */
    handleInput() {
        // console.log()
    }

    checkUserName() {
        if (this.form.userName) {
            this.disable2 = false;
        }
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
    background-color: #f0f0f0; /* 添加背景色 */
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
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    background-color: #fff;
    width: 100%;
    height: 100%;
    margin-top: 0;
}

</style>



