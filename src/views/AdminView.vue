<template>
    <div class="main">
        <el-table :data="userEvents" border>
            <el-table-column prop="userName" label="姓名"></el-table-column>
            <el-table-column label="操作">
                <template v-slot="scope">
                    <el-button type="primary" @click="downloadEventLogs(scope.row.userName)">
                        下载写作过程数据
                    </el-button>
                    <el-button type="success" @click="viewReplay(scope.row.userName)">
                        查看回放
                    </el-button>
                  <el-button @click="deleteUser(scope.row.userName)">
                    删除
                  </el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-button @click="returnBack" style="margin-rigth: 50px;">返回</el-button>
    </div>
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component';
import axios from 'axios';
import {ElMessageBox, Message} from "element-plus";
import Papa from "papaparse";

@Options({
    name: 'AdminView',
})
export default class AdminView extends Vue {
    userEvents: any[] = [];
    $message: Message;
    mounted() {
        this.getUserEvents();
    }

    returnBack() {
        this.$router.push('/record');
    }

    async getUserEvents() {
        try {
            const token = localStorage.getItem('adminToken'); // 从本地存储获取JWT令牌
            const config = {
                headers: {
                    'Authorization': token // 将JWT令牌添加到请求头
                }
            };
            // console.log(config)
            const response = await axios.get('http://127.0.0.1:5000/api/get_all_user_events', config);
            this.userEvents = response.data;
        } catch (error) {
            this.$message.error('获取用户信息失败');
            console.error('Failed to fetch user events', error);
        }
    }


    async downloadEventLogs(userName: string) {
        ElMessageBox.confirm("是否下载击键记录数据?", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
        })
            .then(() => {
                // 查找匹配的对象
              const userEvent = this.userEvents.find(event => event.userName === userName);
              if (userEvent) {
                // 获取与 eventLogs 顺序一致的数据
                const orderedEventLogs = userEvent.eventLogs.map(log => ({
                  index: log.index || "", // 如果 index 属性不存在，则使用空字符串代替
                  classKey: log.classKey || "",
                  text: log.text || "",
                  ChineseText: log.ChineseText || "",
                  IMEBuffer: log.IMEBuffer || "",
                  ChineseLength: log.ChineseText ? log.ChineseText.length : 0, // 计算 ChineseText 的长度
                  IMEBuffer_length: log.IMEBuffer ? log.IMEBuffer.length : 0, // 计算 IMEBuffer 的长度
                  textLength: log.text ? log.text.length : 0, // 计算 text 的长度
                  keyValue: log.keyValue || "",
                  keyAction: log.keyAction || "",
                  timeStamp: log.timeStamp || ""
                }));

                // 将 orderedEventLogs 转换为 CSV 格式
                const csv = Papa.unparse(orderedEventLogs);
                const csvData = new Blob([csv], {type: "text/csv;charset=utf-8;"});
                const csvURL = window.URL.createObjectURL(csvData);
                const tempLink = document.createElement("a");
                tempLink.href = csvURL;
                tempLink.setAttribute("download", userName);
                document.body.appendChild(tempLink);
                tempLink.click();
                document.body.removeChild(tempLink);
              } else {
                console.error("User event not found");
              }

            })
            .catch(() => {
                // 取消
            });
    }

    async deleteUser(userName: string) {
        ElMessageBox.confirm("是否删除用户数据?", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
        })
            .then(async () => {
                try {
                    const token = localStorage.getItem('adminToken'); // 从本地存储获取JWT令牌
                    const config = {
                        headers: {
                            'Authorization': token // 将JWT令牌添加到请求头
                        }
                    };
                    // console.log(config)
                    const response = await axios.post('http://127.0.0.1:5000/api/delete_user_events', { userName }, config);
                    // 在删除成功后刷新用户事件列表
                    if (response.status === 200) {
                        await this.getUserEvents();
                    }
                    this.$message.success('删除用户数据成功');
                } catch (error) {
                    console.error('Failed to delete user events', error);
                    this.$message.error('删除用户数据失败');
                }
            })
            .catch(() => {
                // 取消
            });
    }


  viewReplay(userName: string) {
        this.$router.push({path: "/replay", query: {userName}});
    }

}
</script>

<style scoped>
.main{
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: flex-end;
}
</style>
