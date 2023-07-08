<template>

  <div class="layout-container">
    <div class="header">
      <div
          class="sidebar-header"
      >
        <img src="@/assets/logo.png" alt="" style="width: 5em; height: 5em; margin-left: 30px">
        <div class="toggle-button">
          <el-button @click="toggleSidebar" style="width: 2em; height: 2em;">
            <Expand style="width: 2em; height: 2em;" v-if="!sidebarVisible"/>
            <Fold style="width: 2em; height: 2em;" v-if="sidebarVisible"/>
          </el-button>
        </div>
      </div>
      <div class="right-header">
        <h1>在线写作分析平台</h1>
        <div class="logo">
          <div class="full"><FullScreen style="width: 1.5em; height: 1.5em;  cursor: pointer; margin-right: 30px;" @click="fullScreen"/></div>
          <el-dropdown @command="handleCommand">
            <div class="el-dropdown-link">
              <User style="width: 2.5em; height: 2.5em; cursor: pointer;"></User>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="changePassword">修改密码</el-dropdown-item>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        <passwordChangeDialog ref="passwordDialog"></passwordChangeDialog>
      </div>
    </div>
    <div class="app-layout">
      <el-container>
        <el-aside
            :style="{ display: sidebarVisible ? 'block' : 'none', width: '150px', height: '100%' }"
            class="aside"
        >
          <el-menu class="el-menu" default-active="1">
            <el-menu-item index="1">
              <Menu style="width: 1em; height: 1em;"/>
              <router-link to="/student/writingList">任务列表</router-link>
            </el-menu-item>
<!--            <el-menu-item index="2">-->
<!--              <Menu style="width: 1em; height: 1em;"/>-->
<!--              <router-link to="/admin/dashBoard">数据分析</router-link>-->
<!--            </el-menu-item>-->
            <el-menu-item index="2">
              <Menu style="width: 1em; height: 1em;"/>
              <router-link to="/student/dashBoard">我的成绩</router-link>
            </el-menu-item>
<!--            <el-menu-item index="4">-->
<!--              <router-link to="/record">返回</router-link>-->
<!--            </el-menu-item>-->
          </el-menu>
        </el-aside>
        <el-container direction="vertical">
          <div class="tab-bar">
            <el-tabs type="border-card" v-model="activeTabIndex" style="height:10px;">
              <template v-for="(tab, index) in tabsStore.tabs" :key="index">
                <el-tab-pane :key="tab.identifier" v-if="tabsStore.tabs.length > 0">
                  <template v-slot:label>
                    <div @click="switchTab(tab.path, tab.query)">
                      {{ tab.label }}
                      <Close
                          style="width: 1em; height: 1em;"
                          @click.stop="closeTab(tab.path)"
                      />
                    </div>
                  </template>
                </el-tab-pane>
              </template>
            </el-tabs>
          </div>
          <div class="main-content">
            <el-main class="el-main">
              <router-view :key="$route.fullPath" />
            </el-main>
          </div>
        </el-container>
      </el-container>
    </div>
  </div>
</template>

<script lang="ts" name="studentView">
import {Options, Vue} from 'vue-class-component';
import {useTabsStore} from '@/store/index';
import {
  ElContainer,
  ElHeader,
  ElAside,
  ElMain,
  ElRow,
  ElCol,
  ElMenu,
  ElMenuItem,
  ElButton,
  ElTooltip,
  ElTabs,
  ElTabPane,
} from 'element-plus';
import {Message} from 'element-plus';
import passwordChangeDialog from '@/components/passwordChangeDialog.vue';

@Options({
  components: {
    ElContainer,
    ElHeader,
    ElAside,
    ElMain,
    ElRow,
    ElCol,
    ElMenu,
    ElMenuItem,
    ElButton,
    ElTooltip,
    ElTabs,
    ElTabPane,
    passwordChangeDialog
  },
})
export default class AppLayout extends Vue {
  sidebarVisible = true;
  tabsStore = useTabsStore();
  activeTabIndex = '0';
  $messgae: Message;

  mounted() {
    this.calculateWidths();
    window.addEventListener('resize', this.calculateWidths);

    // 添加页面加载时的初始折叠状态
    if (window.innerWidth < 800) {
      this.sidebarVisible = false;
    }

  }

  switchTab(path: string, query: any) {
    this.$router.push({path: path, query: query});
  }


  fullScreen() {
    const elMain = document.querySelector('.el-main');
    if (elMain) {
      if (elMain.requestFullscreen) {
        elMain.requestFullscreen();
      } else if ((elMain as any).mozRequestFullScreen) {
        (elMain as any).mozRequestFullScreen();
      } else if ((elMain as any).webkitRequestFullscreen) {
        (elMain as any).webkitRequestFullscreen();
      } else if ((elMain as any).msRequestFullscreen) {
        (elMain as any).msRequestFullscreen();
      }
    }
  }

  handleCommand(command: string) {
    switch (command) {
      case 'changePassword':
        // 引用 PasswordChangeDialog 组件的 open 方法
        (this.$refs.passwordDialog as any).open();
        break;
      case 'logout':
        this.$router.push({path: '/login'});
        // 清除 token
        localStorage.removeItem('studentToken');
        localStorage.removeItem('studentId');
        // 使得 store 中tabs为空
        this.tabsStore.tabs = [];
        break;
    }
  }

  // handleCommand = (command: string | number | object) => {
  //   this.$messgae.info(`click on item ${command}`)
  // }

  beforeUnmount() {
    window.removeEventListener('resize', this.calculateWidths);
  }

  created() {
    // 监听路由变化并添加新选项卡到 store
    this.$watch(
        () => ({path: this.$route.path, query: this.$route.query}),
        (newValue) => {
          this.tabsStore.addTab({
            path: newValue.path,
            label: this.$route.meta.label,
            componentName: this.$route.meta.key,
            query: newValue.query,
          });

          // 确保在 DOM 更新后再获取新的 activeTabIndex
          this.$nextTick(() => {
            let currentIndex = this.tabsStore.tabs.findIndex(tab => tab.identifier === `${newValue.path}:${newValue.query?.userName}`);
            this.activeTabIndex = currentIndex >= 0 ? String(currentIndex) : undefined;
            // console.log(  this.activeTabIndex)
          })
        },
        {immediate: true, deep: true}
    );

  }

  closeTab(path: string) {
    const currentViewIndex = this.tabsStore.tabs.findIndex(
        (tab: any) => tab.path === path
    );

    if (currentViewIndex > -1) {
      this.tabsStore.removeTab(currentViewIndex);
    }

    if (this.tabsStore.tabs.length > 0) {
      const newPath = this.tabsStore.tabs[
          Math.min(currentViewIndex, this.tabsStore.tabs.length - 1)
          ].path;
      this.$router.push(newPath);
    }
  }

  calculateWidths() {
      // 添加页面宽度改变时的折叠状态
      if (window.innerWidth < 800) {
        this.sidebarVisible = false;
      } else {
        this.sidebarVisible = true;
      }

  }

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }
}
</script>


<style>
.layout-container {
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  /* 添加边框和阴影 */
  box-shadow: 2px 2px 15px #ddd;
}

.header {
  display: flex;
  flex-direction: row;
  height: 80px;
  width: 100%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin: 0;
  padding: 0;
}


.sidebar-header {
  width: 150px;
  height: 80px;
  position: relative;
  background-color: #faefef;
  top:0px;
  left:0px;
}

.right-header {
  width: calc(100% - 150px);
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0;
  padding: 0;
  background-color: #f1efef;
}

.right-header h1 {
  margin: 0;
  font-size: 34px;
  color: #0088cc;
  /* 修改字体为楷体 */
  font-family: "楷体";
}

.app-layout {
  display: flex;
}

/* 选中状态背景颜色 */
.el-menu>.el-menu-item.is-active {
  background-color: #d2f2f5;
}

.el-menu>.el-menu-item {
  background-color: #f0f2f5;
  font-family: "楷体";
  font-size: 20px;
  text-decoration: none;   /*删除下划线*/
  color: #000000;
  border: 1px solid #ebebeb;
}

.el-menu > .el-menu-item:last-child {
  border-bottom: none;
}

.el-menu>.el-menu-item>a{
  text-decoration: none;
  color: #000000;
  text-decoration-line: none;
}

.el-menu{
  text-decoration: none;
}

.aside {
  background-color: #f0f2f5;
  border-right: 1px solid #ccc;
  width: 100px;
  height: 80%;
  /* 添加过渡动画 */
  transition: all 0.3s ease-in-out;
}

.main-content {
  height: calc(100vh - 110px); /* 设置内容区域的高度 */
  overflow-y: auto; /* 添加垂直滚动条 */
  position: relative;
  padding: 0;
}

.el-main{
  padding: 0;
  height: 100%;
  background-color: #ffffff;
}

h1 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

/* toggle-button位于sidebar-header右下角,而不是屏幕右下角*/
.toggle-button {
  position: absolute;
  z-index: 999;
  bottom: 0;
  left: 0;
}

.tab-bar {
  height: 40px;
  width: 100%;
  font-size: 15px;
  background-color: #ebebeb;
}

.example-showcase .el-dropdown-link {
  cursor: pointer;
  color: var(--el-color-primary);
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  margin-left: auto;
  margin-right: 20px;
}

.full{
  cursor: pointer;
}

.logo{
  position: absolute;
  right: 30px;
  top: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
