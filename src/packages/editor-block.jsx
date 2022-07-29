/*
 * @Author: yfp
 * @Date: 2022-07-26 11:57:33
 * @LastEditors: yfp
 * @LastEditTime: 2022-07-27 14:41:08
 * @Description: 
 */
import { defineComponent, computed, inject, onMounted, ref } from 'vue'
export default defineComponent({
  props: {
    block: {
      type: Object,
    }
  },
  setup (props) {
    const blockStyles = computed(() => ({
      top: `${props.block.top}px`,
      left: `${props.block.left}px`,
      zIndex: `${props.block.zIndex}`,
    }));
    const config = inject('config');
    const blockRef = ref(null);
    onMounted(() => {
      let { offsetWidth, offsetHeight } = blockRef.value;
      // console.log('当前呢元素', blockRef.value, offsetWidth, offsetHeight);
      if(props.block.alignCenter) { // 说明是拖拽松手的时候才渲染的，其它的默认渲染到页面上的内容不需要局中
        props.block.left = props.block.left - offsetWidth / 2;
        props.block.top = props.block.top - offsetHeight / 2;
        props.block.alignCenter = false; // 让渲染后的结果才能去居中 只有第一次需要居中处理
      }
      // 记录渲染元素的宽高、便于添加辅助线
      props.block.width = offsetWidth;
      props.block.height = offsetHeight;
    });
    return () => {
      // 通过block的key属性直接获取对应的组件
      const component = config.componentMap[props.block.key];
      // 获取render函数
      const RenderComponent = component.render();
      return <div class="editor-block" ref={blockRef} style={blockStyles.value}>{RenderComponent}</div>
    }
  }
})