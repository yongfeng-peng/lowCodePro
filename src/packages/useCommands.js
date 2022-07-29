/*
 * @Author: yfp
 * @Date: 2022-07-27 17:10:08
 * @LastEditors: yfp
 * @LastEditTime: 2022-07-29 15:25:20
 * @Description: 
 */
import { events } from "./event";
import deepcopy from 'deepcopy'
import { onUnmounted } from "vue";

export function useCommands(data) {
  // 前进、后退需要指针
  const state = {
    current: -1, // 前进、后退索引值
    queue: [], // 存放所有的操作命令
    commands: {}, // 制作命令和执行功能一个映射表 undo: () => {} redo: () => {}
    commandArray: [], // 存放所有的命令
    destroyArray: [], // 销毁列表
  };
  const registry = (command) => {
    state.commandArray.push(command);
    // 命令名字的执行函数
    state.commands[command.name] = () => {
      // debugger
      const { redo, undo } =  command.execute();
      redo();
      if (!command.pushQueue) {
        // 不要存放到队列中，直接跳过
        return;
      }
      let { queue, current } = state;
      // 如果先放了 组件1 -》组件2 =》撤回 -》 组件3
      // 组件1 -》组件3
      if(queue.length > 0) {
        // 可能在放置的过程中有撤销操作，根据最新的current值来计算新的队列
        queue = queue.slice(0, current + 1);
        state.queue = queue;
      }
      // 保存指令的前进后退
      queue.push({undo, redo});
      state.current = current + 1;
      console.log('拖拽后存放队列queue', queue);
    }
  };
  // 注册命令
  registry({
    name: 'redo',
    keyboard: 'ctrl + y',
    execute () {
      return {
        redo () {
          console.log('重做');
          let item = state.queue[state.current + 1]; // 找到下一步
          if (item) {
            item.redo && item.redo();
            state.current++;
          }
        }
      }
    }
  })
  registry({
    name: 'undo',
    keyboard: 'ctrl + z',
    execute() {
      return {
        redo() {
          console.log('撤销');
          if(state.current == -1) return; // 没有可以撤销的
          let item = state.queue[state.current]; // 找到上一步
          if(item) {
            item.undo && item.undo(); // 这里没有操作队列
            state.current--;
          }
        }
      }
    }
  })
  // 希望将操作放到队列中 可以增加一个属性 标识等会操作放到队列中
  registry({
    name: 'drag',
    pushQueue: true,
    init() {
      // debugger
      // 初始化操作 就会执行
      this.before = null;
      // 监控拖拽开始事件 保存状态
      const start = () => {
        // debugger
        this.before = deepcopy(data.value.blocks)
      };
      // 拖拽之后 需要触发对应的指令
      const end = () => {
        // debugger
        state.commands.drag()
      };
      events.on('start', start);
      events.on('end', end);
      // 卸载 解绑
      return () => {
        events.off('start', start);
        events.off('end', end);
      }
    },
    execute () {
      let before = this.before;
      let after = data.value.blocks; // 之后的状态
      return {
        redo () {
          // 默认一松手，就直接把当前事件做了
          data.value = { ...data.value, blocks: after };
        },
        undo () {
          // 前一步的
          data.value = { ...data.value, blocks: before };
        },
      }
    }
  });
  const keyboardEvent = (() => {
    const onKeydown = (e) => {
      const keyCodes = {
        90: 'z',
        89: 'y'
      };
      const { ctrlKey, keyCode } = e; // ctrl + z; ctrl + y

      let keyString = [];
      if (ctrlKey) keyString.push('ctrl');
      keyString.push(keyCodes[keyCode]);
      keyString = keyString.join(' + ');
      state.commandArray.forEach(({keyboard, name}) => {
        if (!keyboard) return; // 没有键盘事件
        if (keyboard === keyString ) {
          state.commands[name]();
          e.preventDefault();
        }
      })
    };
    const init = () => { // 初始化事件
      window.addEventListener('keydown', onKeydown);
      return () => { // 销毁事件
        window.removeEventListener('keydown', onKeydown);
      }
    };
    return init;
  })();
  // 处理初始化执行函数
  ;(() => {
    // 监听键盘事件
    state.destroyArray.push(keyboardEvent());
    state.commandArray.forEach(command => command.init && state.destroyArray.push(command.init()))
  })();

  onUnmounted(() => {
    // 清理绑定事件
    state.destroyArray.forEach(fn => fn && fn());
  })
  return state;
}