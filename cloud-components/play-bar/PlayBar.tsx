let React

import {
  defineComponent,
  onBeforeUnmount,
  onMounted,
  onUnmounted,
  ref,
  Ref,
  provide,
  inject,
  watchEffect,
  defineExpose,
  watch,
  computed,
} from 'vue'

import './index.scss'

import {
  CutsBtns,
  ProgressBar,
  MidContent,
  MainWrap,
  RightTools,
  UpDownCtrl,
  DecoratedElements,
  PlayBarWrap,
  Audio,
  PlayPanel,
} from './components'
import { usePlayRecord, usePlayOrder, useCurId, useScrollList } from '../hooks'
import { SongItem } from './types'
import { registKeyEvent } from './keyboardEvents'

// const React = {}

const PlayBar = defineComponent({
  name: 'PlayBar',
  props: {
    id: {
      // 当前歌曲id
      type: Number,
      default: 188261, // 咖啡
    },
  },
  setup(props) {
    const playState: Ref<boolean> = ref(false)
    const audio = ref()
    const historyRecord = usePlayRecord() as Ref<Array<SongItem>>
    const id = computed(() => props.id)
    const memoId = useCurId()
    const curId = memoId.value
      ? ref(Number(memoId.value))
      : ref(Number(props.id))
    const playOrder = usePlayOrder()
    // 全局注入
    provide('playState', playState)
    provide('fullTime', ref(0))
    provide('isLoading', ref(true))
    provide('buffered', ref('0%'))
    provide('curTime', ref(0))
    provide('curId', curId)
    // provide('record', ref([188261, 211170, 188259]))
    provide('historyRecord', historyRecord)
    provide('showPanel', ref(false))
    provide('playOrder', playOrder)
    provide('jumpToTime', (timeStamp: number) => {
      audio.value.jumpToTime(timeStamp)
    })
    provide('lock', ref(true))

    // 注册键盘快捷键
    registKeyEvent({
      prev() {
        cutBtns.value.handleCut(false)
      },
      next() {
        cutBtns.value.handleCut(true)
      },
      playPause() {
        cutBtns.value.togglePlay()
      },
    })

    watchEffect(() => {
      if (!audio.value) return
      if (playState.value) {
        // 开始播放
        audio.value.play()
      } else {
        // 暂停播放
        audio.value.pause()
      }
    })

    // 获取切换按钮ref，控制当前歌曲结束时切换动作
    const cutBtns = ref()
    provide('cutBtns', cutBtns)
    function endNotice() {
      if (playOrder.value < 2) {
        // 列表循环/随机
        if (historyRecord.value.length <= 1) {
          return (playState.value = false)
        }
        cutBtns.value.handleCut(true)
      }
    }

    watch(id, (now) => {
      curId.value = now
      useScrollList()
    })
    watch(curId, (now) => {
      memoId.value = now
      useScrollList()
    })

    function renderContent() {
      return (
        <>
          <UpDownCtrl />
          <DecoratedElements />
          <MainWrap
            v-slots={{
              left: () => <CutsBtns ref={cutBtns} />,
              mid: () => <MidContent />,
              right: () => <RightTools />,
            }}
          ></MainWrap>
          <PlayPanel />
          <Audio ref={audio} onEnd={endNotice} />
        </>
      )
    }
    return {
      renderContent,
      historyRecord,
    }
  },
  render() {
    return <PlayBarWrap renderContent={this.renderContent} />
  },
})

export default PlayBar
