// 注册键盘快捷键
import { Directive, onMounted, nextTick } from 'vue'
import { useScrollList } from '../hooks'

const vLis: Directive = {
  mounted(el) {
    console.log(el)
  },
}

interface handlerMap {
  [fn: string]: () => any
}

function registKeyEvent(fnMap: handlerMap) {
  let isCtrlDown = false //ctrl是否按下
  onMounted(() => {
    // 按下ctrl键，开关闭合
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.ctrlKey) isCtrlDown = true
    })
    // 松开ctrl键，开关打开
    window.addEventListener('keyup', (e: KeyboardEvent) => {
      if (isCtrlDown) {
        if (e.key === 'ArrowRight') {
          fnMap.next()
        }
        if (e.key === 'ArrowLeft') {
          fnMap.prev()
        }
      }
      if (e.key === 'p') {
        fnMap.playPause()
      }
      if (e.key === 'Control') isCtrlDown = false
    })
  })
}

export { vLis, registKeyEvent }
