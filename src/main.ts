import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from "pinia";

// 创建 Pinia 实例
const pinia = createPinia();


// 挂载到 Vue 根实例
createApp(App).use(pinia).use(router).mount('#app')
