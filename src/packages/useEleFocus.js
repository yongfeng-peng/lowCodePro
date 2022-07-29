/*
 * @Author: yfp
 * @Date: 2022-07-27 10:58:35
 * @LastEditors: yfp
 * @LastEditTime: 2022-07-27 14:31:30
 * @Description: 
 */
import { computed, ref } from 'vue'
export function useEleFocus(data, callback) {
  const selectIndex = ref(-1); // 表示没有任何一个被选中
  // 最后选择的那一个
  const lastSelectBlock = computed(() => data.value.blocks[selectIndex.value]);
  // 计算当前被选中 和 未被选中的
  const focusData = computed(() => {
    let focus = [];
    let unFocused = [];
    data.value.blocks.forEach(block => (block.focus ? focus : unFocused).push(block));
    return { focus, unFocused };
  });
  const clearBlockFocus = () => {
    data.value.blocks.forEach(block => block.focus = false);
  };
  const blockMousedown = (e, block, index) => {
    // 选中默认行为
    e.preventDefault();
    e.stopPropagation();
    // block上规划一个属性 focus获取焦点后就将focus 变为true
    if (e.shiftKey) {
      if(data.value.focus.length <= 1) {
        // 当前节点只有一个被选中时，按住shift键也不会切换focus状态
        block.focus = true;
      } else {
        block.focus = !block.focus;
      }
    } else {
      if (!block.focus) {
        // 选中之前，清空其它的focus
        clearBlockFocus();
        block.focus = true;
      } 
      // 当自己被选中之后，再次点击时还是被选中状态
      // else {
      //   block.focus = false;
      // }
    }
    selectIndex.value = index;
    callback(e);
  };
  const containerMousedown = () => {
    // 重置
    selectIndex.value = -1;
    // 点击容器让选中的失去焦点
    clearBlockFocus();
  };
  return {
    focusData,
    blockMousedown,
    containerMousedown,
    lastSelectBlock
  }
}