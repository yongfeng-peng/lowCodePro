/*
 * @Author: yfp
 * @Date: 2022-07-26 11:04:51
 * @LastEditors: yfp
 * @LastEditTime: 2022-07-27 17:51:33
 * @Description: 
 */
import './editor.scss';
import EditorBlock from './editor-block'
import { useMenuDragger } from './useMenuDragger'
import { useEleFocus } from './useEleFocus'
import { useBlockDragger } from './useBlockDragger'
import { useCommands } from './useCommands'
import { defineComponent, computed, inject, ref }  from 'vue'
import deepcopy from 'deepcopy'

export default defineComponent({
  props: {
    modelValue: {
      type: Object,
    }
  },
  emits: ['update:modelValue'], // 触发事件 冒号两边不能有空格
  setup (props, { emit }) {
    const data = computed({
      get() {
        return props.modelValue
      },
      set(newValue) {
        emit('update:modelValue', deepcopy(newValue));
      }
    });

    const containerStyles = computed(() => ({
      width: data.value.container.width + 'px',
      height: data.value.container.height + 'px',
    }));
    const config = inject('config');
    const containerRef = ref(null);
    // 1.实现左侧菜单拖拽功能
    const { dragstart, dragend } = useMenuDragger(containerRef, data);
    // 2.实现获取焦点, 可能选中之后直接就进行拖拽
    const { focusData, blockMousedown, containerMousedown, lastSelectBlock } = useEleFocus(data, (e) => {
      // console.log('选中后', focusData.value.focus);
      // 获取焦点之后拖拽
      mousedown(e);
    });
    // 实现组件拖拽
    const { mousedown, markLine } = useBlockDragger(focusData, lastSelectBlock, data);
    // 3.实现拖拽多个元素
    const { commands } = useCommands(data);
    const buttons = [
      { label: '撤销', icon: '', handler: () => commands.undo() },
      { label: '重做', icon: '', handler: () => commands.redo() },
    ];
    return () => <div class="editor">
      <div class="editor-left">
        { /* 根据注册列表 渲染对应内容 可以实现h5的拖拽 */}
        {
          config.componentList.map(component => (
            <div
              class="editor-left-item"
              draggable
              onDragstart={e => dragstart(e, component)}
              onDragend={dragend}
            >
              <span>{ component.label }</span>
              <div>{ component.preview() }</div>
            </div>
          ))
        }
      </div>
      <div class="editor-top">
        {
          buttons.map((btn, index) => {
            return <div class="editor-top-button" onClick={btn.handler}>
              <i class={btn.icon}></i>
              <span>{btn.label}</span>
            </div>
          })
        }
      </div>
      <div class="editor-right">右侧</div>
      <div class="editor-container">
        { /* 负责滚动条 */ }
        <div class="editor-container-canvas">
          { /* 产生内容区域 */}
          <div class="editor-container-canvas_content"
            style={containerStyles.value} ref={containerRef}
            onMousedown={containerMousedown}
          >
            {
              (data.value.blocks.map((block, index) => (
                <EditorBlock
                  class={block.focus ? 'editor-block-focus' : ''}
                  block={block}
                  onMousedown={(e) => blockMousedown(e, block, index)}
                ></EditorBlock>
              )))
            }
            {markLine.x !== null && <div class="line-x" style={{ left: markLine.x + 'px' }}></div>}
            {markLine.y !== null && <div class="line-y" style={{ top: markLine.y + 'px' }}></div>}
          </div>
        </div>
      </div>
    </div>
  }
})