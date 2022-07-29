/*
 * @Author: yfp
 * @Date: 2022-07-26 10:50:47
 * @LastEditors: yfp
 * @LastEditTime: 2022-07-26 14:34:53
 * @Description: 
 */
import { createApp } from 'vue'
import App from './App.vue'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App)

app.use(ElementPlus)
app.mount('#app')

// 1.构造假数据，实现位置渲染
// 2.配置组件对应的映射关系{preview: xxx, render: xxx}
