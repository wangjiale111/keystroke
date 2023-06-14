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
          <h1>keystroke数据分析平台</h1>
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
              <router-link to="/admin/user">用户列表</router-link>
            </el-menu-item>
            <el-menu-item index="2">
              <router-link to="/admin/dashBoard">数据分析</router-link>
            </el-menu-item>
            <el-menu-item index="3">
              <router-link to="/record">写作记录</router-link>
            </el-menu-item>
          </el-menu>

        </el-aside>
        <el-container>
          <el-main class="main-content">
            <el-tabs type="border-card">
              <router-view
                  v-slot="{ Component, route }"
                  :key="$route.path"
                  v-bind:component=Component
              >
                <keep-alive>
                  <el-tab-pane :label="route.meta.label" :key="route.path">
                    <Close
                        v-slot="label"
                        style="width: 2em; height: 2em;"
                        @click.stop="closeTab(route.path)"
                    />
                    <Component />
                  </el-tab-pane>
                </keep-alive>
              </router-view>
            </el-tabs>
          </el-main>
        </el-container>
      </el-container>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Options } from "vue-class-component";
import "element-plus/theme-chalk/index.css";
import store from '@/store/index.ts';
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
  $store :store;

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

  created() {
    // 监听路由变化并添加新选项卡到 store
    this.$watch(
        "$route",
        () => {
          this.$store.commit("ADD_TAB", {
            path: this.$route.path,
            label: this.$route.name,
            componentName: this.$route.meta.key,
          });
        },
        { immediate: true }
    );
  }

  closeTab(path: string) {
    const currentViewIndex = this.$store.state.tabs.findIndex(
        (tab: any) => tab.path === path
    );

    if (currentViewIndex > -1) {
      this.$store.commit("REMOVE_TAB", currentViewIndex);
    }

    if (this.$store.state.tabs.length > 0) {
      const newPath = this.$store.state.tabs[
          Math.min(currentViewIndex, this.$store.state.tabs.length - 1)
          ].path;
      this.$router.push(newPath);
    }
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
