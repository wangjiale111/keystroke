<template>
  <div class="layout-container">
    <div class="header">
      <div
          class="sidebar-header"
      >
        <img src="@/assets/logo.png" alt="" style="width: 5em; height: 5em; margin-left: 30px">
        <div class="toggle-button">
          <el-button @click="toggleSidebar" style="width: 2em; height: 2em;">

            <Operation style="width: 2em; height: 2em;" v-if="!sidebarVisible" />
            <Fold style="width: 2em; height: 2em;" v-if="sidebarVisible"/>
          </el-button>
        </div>
      </div>
      <div class="right-header" :style="{ width: mainWidth + 'px' }">
          <h1>keystroke数据收集平台</h1>
      </div>
    </div>
    <div class="app-layout">
      <el-container>
        <el-aside
            :style="{ display: sidebarVisible ? 'block' : 'none', width: '150px', height: '100%' }"
            class="aside"
        >
          <el-menu>
            <el-menu-item index="1">
              <router-link to="/admin/user">
                用户列表
              </router-link>
            </el-menu-item>
            <router-link to="/admin/dashBoard">
              <el-menu-item index="2">
                数据分析
              </el-menu-item>
            </router-link>
            <router-link to="/record">
              <el-menu-item index="3">
                写作记录
              </el-menu-item>
            </router-link>
          </el-menu>
        </el-aside>
        <el-container>
          <el-main class="main-content">
            <router-view></router-view>
          </el-main>
        </el-container>
      </el-container>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Options } from "vue-class-component";
import "element-plus/theme-chalk/index.css";
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
} from "element-plus";

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
  },
})
export default class AppLayout extends Vue {
  sidebarVisible = true;
  mainWidth = 0;

  mounted() {
    this.calculateWidths();
    window.addEventListener("resize", this.calculateWidths);

    // 添加页面加载时的初始折叠状态
    if (window.innerWidth < 800) {
      this.sidebarVisible = false;
    }
  }

  beforeUnmount() {
    window.removeEventListener("resize", this.calculateWidths);
  }

  calculateWidths() {
    const asideElement = document.querySelector(".aside");
    const mainElement = document.querySelector(".main-content");
    if (asideElement && mainElement) {
      const mainWidth = mainElement.getBoundingClientRect().width;
      this.mainWidth = Math.floor(mainWidth);

      // 添加页面宽度改变时的折叠状态
      if (window.innerWidth < 800) {
        this.sidebarVisible = false;
      } else {
        this.sidebarVisible = true;
      }
    }
  }

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }
}
</script>

<style>
.layout-container {
  height: 97vh; /* 设置为视口高度 */
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 添加overflow: hidden以阻止整个页面滚动 */
}

.header{
  display:flex;
  flex-direction: row;
  height: 80px;
  width: 100%;
  border-bottom: 1px solid #ccc;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.app-layout {
  display: flex;
}


.aside {
  background-color: #f0f2f5;
  border-right: 1px solid #ccc;
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
  width: 20%;
}

.sidebar-header {
  width: 150px;
  height: 100%;
  position: relative;
  border-right: 1px solid #ccc;
}

.right-header{
  width: 80%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  border-right: 1px solid #ccc;
}

.aside {
  width: 100px;
  height: 80%;
  transition: width 0.3s ease-in-out;
}

.main-content {
  height: calc(100vh - 80px); /* 设置内容区域的高度 */
  overflow-y: auto; /* 添加垂直滚动条 */
  position: relative;
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
  bottom:0;
  right:0;
}

</style>
