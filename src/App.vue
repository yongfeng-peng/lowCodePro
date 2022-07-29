<!--
 * @Author: yfp
 * @Date: 2022-07-26 10:50:47
 * @LastEditors: yfp
 * @LastEditTime: 2022-07-26 17:52:55
 * @Description: 
-->
<template>
  <div class="app">
    <Editor v-model="state"></Editor>
  </div>
</template>

<script>
import data from './data.json'
import Editor from './packages/editor'
import { registerConfig as config } from './utils/editor-config'
import { provide, ref, watch } from 'vue'
export default {
  components: {
    Editor
  },
  setup() {
    const state = ref(data);
    provide('config', config); // 将组件的配置直接传递
    return {
      state
    }
  }
}
</script>

<style lang="scss">
.app {
  position: fixed;
  top: 20px;
  left: 20px;
  right: 20px;
  bottom: 20px;
}
</style>
