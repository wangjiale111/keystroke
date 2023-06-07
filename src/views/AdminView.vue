<template>
  <div class="sidebar-header">写作过程
    <el-button @click="toggleSidebar" circle="true" style="width: 2.5em; height: 2.5em;">
      <el-tooltip content="收起菜单" placement="right">
        <Menu style="width: 2em; height: 2em;" />
      </el-tooltip>
    </el-button>
  </div>
  <el-container class="app-layout">
    <el-aside :style="{display: sidebarVisible ? 'block' : 'none'}" class="aside">
      <el-menu>
        <router-link to="/user">
          <el-menu-item index="1">
            用户列表
          </el-menu-item>
        </router-link>
        <router-link to="/dashBoard">
          <el-menu-item index="2">
            数据分析
          </el-menu-item>
        </router-link>
        <el-menu-item index="3" @click="returnBack">
          返回
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="el-header" :style="{ marginLeft: sidebarVisible ? sidebarWidth : '0' }">
        <el-row type="flex" justify="start" align="middle">
          <el-col :span="18">
按钮
          </el-col>
        </el-row>
      </el-header>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
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
  sidebarWidth = "240px"; // 设置侧边栏的宽度

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }

  returnBack() {
    this.$router.push("/record");
  }
}
</script>

<style>
.app-layout {
  height: 100vh;
}

.el-header {
  padding: 16px 24px;
  background-color: #f0f2f5;
  color: white;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 200px;
  width: 100%;
  z-index: 1;
  transition: margin-left 0.3s; /* 添加过渡效果 */
}

h1 {
  margin: 0;
  font-size: 24px;
}

.aside {
  background-color: #f0f2f5;
}

.sidebar-header {
  font-size: 18px;
  padding: 16px 24px;
  font-weight: bold;
  margin-bottom: 16px;
}
</style>
