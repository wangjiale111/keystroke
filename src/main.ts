import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from "pinia";
// 导入element-ui
import ElementPlus from "element-plus"
// element icons
import * as Icons from "@element-plus/icons-vue";
import "element-plus/dist/index.css";
// element dark(内置暗黑模式)
import "element-plus/theme-chalk/dark/css-vars.css";

// 创建 Pinia 实例
const pinia = createPinia();

const app = createApp(App)
Object.keys(Icons).forEach(key => {
    app.component(key, Icons[key as keyof typeof Icons]);
});


app.use(router)
app.use(pinia)
app.use(ElementPlus)
app.mount('#app')

