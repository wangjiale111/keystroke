import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from "pinia";
// 导入element-ui
import ElementPlus from "element-plus"

// 创建 Pinia 实例
const pinia = createPinia();

// 挂载
const app = createApp(App)
app.use(router)
app.use(pinia)
app.use(ElementPlus)
app.mount('#app')

