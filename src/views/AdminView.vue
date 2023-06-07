<!-- AppLayout.vue -->
<template>
  <el-container class="app-layout">
    <el-header>
      <el-row type="flex" justify="space-between" align="middle">
        <el-col>
          <h1>写作过程</h1>
        </el-col>
        <el-col>
          <el-button type="primary" @click="toggleSidebar">
            显示 / 隐藏
          </el-button>
        </el-col>
      </el-row>
    </el-header>

    <el-container>
      <el-aside :style="{display: sidebarVisible ? 'block' : 'none'}" width="200px">
        <el-menu>
          <router-link to="/user">
            <el-menu-item index="1">
              用户列表
            </el-menu-item>
          </router-link>
          <router-link to="/replay">
            <el-menu-item index="2">
              数据分析
            </el-menu-item>
          </router-link>
        </el-menu>
      </el-aside>

      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts">
import {Vue, Options} from "vue-class-component";
import {ElRow, ElCol, ElMenu, ElMenuItem, ElButton} from "element-plus";
import "element-plus/theme-chalk/index.css";

@Options({
  components: {
    ElRow,
    ElCol,
    ElMenu,
    ElMenuItem,
    ElButton,
  },
})
export default class AppLayout extends Vue {
  sidebarVisible = true;

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }
}
</script>

<style>
.app-layout {
  height: 100vh;
}

.el-header {
  padding: 16px 24px;
  background-color: #3a8ee6;
  color: white;
}

h1 {
  margin: 0;
}

.el-aside {
  background-color: #f0f2f5;
}

.el-menu {
  border-right: none;
}

.el-menu-item {
  font-size: 14px;
  color: #3a8ee6;
}
</style>