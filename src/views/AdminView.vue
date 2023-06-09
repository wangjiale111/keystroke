<template>
  <div class="layout-container">
    <div class="header">
      <div class="sidebar-header" :style="{ width: asideWidth + 'px' }">
        <h1>写作过程</h1>
      </div>
      <div class="right-header" :style="{ width: mainWidth + 'px' }">
        <el-button @click="toggleSidebar" style="width: 2.5em; height: 2.5em;">
          <el-tooltip content="收起菜单" placement="right">
            <Menu style="width: 2em; height: 2em;" />
          </el-tooltip>
        </el-button>
      </div>
    </div>
    <div class="app-layout">
      <el-container>
        <el-aside :style="{display: sidebarVisible ? 'block' : 'none'}" class="aside">
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
  asideWidth = 0;
  mainWidth = 0;

  mounted() {
    this.calculateWidths();
    window.addEventListener("resize", this.calculateWidths);
  }

  beforeUnmount() {
    window.removeEventListener("resize", this.calculateWidths);
  }

  calculateWidths() {
    const asideElement = document.querySelector(".aside");
    const mainElement = document.querySelector(".main-content");
    if (asideElement && mainElement) {
      const asideWidth = asideElement.getBoundingClientRect().width;
      const mainWidth = mainElement.getBoundingClientRect().width;
      this.asideWidth = Math.floor(asideWidth);
      this.mainWidth = Math.floor(mainWidth);
    }
  }

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }
}
</script>

<style>
.layout-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
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
  flex: 1;
  display: flex;
}

.aside {
  background-color: #f0f2f5;
  border-right: 1px solid #ccc;
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
}

.sidebar-header {
  width: 20%;
  height: 100%;
  display:flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #ccc;
}

.right-header{
  width: 80%;
  height: 100%;
}

.aside {
  width: 20%;
  height: 80%;
  transition: width 0.3s ease-in-out;
}

.main-content {
  height: calc(100vh - 80px); /* 设置内容区域的高度 */
  overflow-y: auto; /* 添加垂直滚动条 */
}

h1 {
  margin: 0;
  font-size: 24px;
  color: #333;
}
</style>
