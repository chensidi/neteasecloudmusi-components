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
  watch,
  computed,
  Transition,
} from 'vue'
import classNames from 'classnames'
import 'animate.css'

import {
  useTime,
  useSongUrl,
  useSongInfo,
  useArtists,
  usePlayRecord,
  useDownLoadSong,
  useLrc,
  useCurrentInfo,
} from '../hooks'

import { isSongExist, loopOrder, shuffleOrder } from '../utils/tools'

import { SongItem, LrcItem } from './types'

// 切歌按钮组
export const CutsBtns = defineComponent({
  setup({}, { expose }) {
    const historyRecord: Ref<Array<SongItem>> = inject('historyRecord')
    const id: Ref<number> = inject('curId')
    const playState: Ref<boolean> = inject('playState')
    const playOrder: Ref<number> = inject('playOrder')

    function togglePlay() {
      playState.value = !playState.value
    }

    const shuffle = shuffleOrder(historyRecord.value)
    function handleCut(flag: boolean) {
      switch (playOrder.value) {
        case 0:
          return (id.value = loopOrder(id.value, historyRecord.value, flag))
        case 1:
          return (id.value = shuffle(id.value, flag))
        case 2:
          return (id.value = loopOrder(id.value, historyRecord.value, flag))
      }
    }

    expose({
      handleCut,
    })

    return () => {
      return (
        <div class="btns">
          <span
            class="prv"
            title="上一首(ctrl+←)"
            onClick={() => handleCut(false)}
          ></span>
          <span
            class={classNames('j-flag', [playState.value ? 'pas' : 'ply'])}
            title="播放/暂停(p)"
            onClick={() => togglePlay()}
          ></span>
          <span
            class="nxt"
            title="下一首(ctrl+→)"
            onClick={() => handleCut(true)}
          ></span>
        </div>
      )
    }
  },
})

// 进度条
export const ProgressBar = defineComponent({
  name: 'ProgressBar',
  setup() {
    const progress = ref()
    const isPress = ref(true)
    const isLoading: Ref<boolean> = inject('isLoading')
    function handleMouseDown() {
      isPress.value = false
    }
    function handleMouseUp() {
      isPress.value = true
    }
    onMounted(() => {
      window.addEventListener('mouseup', touchUp)
      window.addEventListener('mousemove', touchMove)
    })
    onBeforeUnmount(() => {
      window.removeEventListener('mouseup', touchUp)
      window.removeEventListener('mousemove', touchMove)
    })
    function touchUp() {
      isPress.value = true
    }
    function touchMove(e: MouseEvent) {
      if (isPress.value) return
      goThePoint(e)
    }
    const progressNum: Ref<string | number> = ref(0)
    function goThePoint(e: MouseEvent) {
      const { clientX } = e
      const { x, width } = progress.value.getBoundingClientRect()
      let percent = +(((clientX - x - 0) / width) * 100).toFixed(4)
      if (percent > 100) percent = 100
      progressNum.value = percent
    }

    const jumpToTime: (timeStamp: number) => void = inject('jumpToTime')
    function handleClick(e: MouseEvent) {
      goThePoint(e)
      jumpToTime(((progressNum.value as number) / 100) * allTime.value)
    }

    const allTime: Ref<number> = inject('fullTime')
    const buffered: Ref<string> = inject('buffered')
    const { curTime, fullTime, setCurTime } = useTime(allTime)

    watchEffect(() => {
      let num = ((progressNum.value as number) * allTime.value) / 100
      if (num < 0) num = 0
      setCurTime(+num.toFixed(0))
    })

    const currentTime: Ref<number> = inject('curTime')
    watch(currentTime, (now: number) => {
      progressNum.value = ((now / allTime.value) * 100).toFixed(4)
    })

    return () => {
      return (
        <div class="m-pbar">
          <div class="barbg j-flag" onClick={handleClick} ref={progress}>
            <div class="rdy" style={{ width: buffered.value }}></div>
            <div
              class={classNames('cur', { up: isPress.value })}
              style={{ width: `${progressNum.value}%` }}
            >
              <span
                class={classNames('btn f-tdn f-alpha', {
                  'z-load': isLoading.value,
                })}
                onMousedown={handleMouseDown}
                onMouseup={handleMouseUp}
              >
                <i></i>
              </span>
            </div>
          </div>
          <div class="j-flag time">
            <time>{curTime.value}</time>/<time>{fullTime.value}</time>
          </div>
        </div>
      )
    }
  },
})

const WordsPart = ({ name, artists }) => {
  return (
    <div class="j-flag words">
      <a class="f-thide name fc1 f-fl" title={name}>
        {name}
      </a>
      <span class="mv f-fl"></span>
      <span class="by f-thide f-fl">
        <span>
          <a>{artists}</a>
        </span>
      </span>
    </div>
  )
}

const ImgLink = ({ url, alt }) => {
  return (
    <a class="head j-flag">
      <img src={`${url}?param=34y34`} alt={alt} />
    </a>
  )
}

// 中间主要部分
export const MidContent = defineComponent({
  name: 'MidContent',
  setup() {
    const curId = inject('curId') as Ref<number>
    const { info } = useSongInfo(curId)
    const artists = computed(() => useArtists(info.ar))

    const playRecord: Ref<Array<SongItem>> = inject('historyRecord')
    watch(
      info,
      (now) => {
        // 检测到id不一致，往里新增记录
        if (!isSongExist(now.id, playRecord.value)) {
          playRecord.value.unshift({ ...now })
        }
      },
      {
        immediate: false,
      }
    )
    return () => {
      return (
        <>
          <ImgLink url={`${info!.picUrl}?param=34y34`} alt={info!.name} />
          <div class="play">
            <WordsPart name={info!.name} artists={artists.value}></WordsPart>
            <ProgressBar />
          </div>
        </>
      )
    }
  },
})

// 主要包裹容器
export const MainWrap = defineComponent({
  props: {
    left: Function,
  },
  setup({}, { slots }) {
    return () => {
      return (
        <div class="wrap">
          {slots.left && slots.left()}
          {slots.mid && slots.mid()}
          {slots.right && slots.right()}
        </div>
      )
    }
  },
})

// 右侧工具栏
export const RightTools = defineComponent({
  setup() {
    const showPanel: Ref<boolean> = inject('showPanel')
    const historyRecord: Ref<Array<any>> = inject('historyRecord')
    const recordNumber = computed(() => historyRecord.value.length)
    const playOrder: Ref<number> = inject('playOrder')

    // 切换播放顺序
    function switchPlayOrder() {
      if (playOrder.value === 2) {
        playOrder.value = 0
      } else {
        playOrder.value += 1
      }
    }

    // icon类名
    const icoClass = [
      { name: 'icn-loop', title: '列表循环' },
      { name: 'icn-shuffle', title: '随机' },
      { name: 'icn-one', title: '单曲循环' },
    ]
    return () => {
      return (
        <div class="ctrl f-fl f-pr j-flag">
          <span class="icn icn-pip active" title="画中画歌词"></span>
          <span
            class={classNames('icn', icoClass[playOrder.value].name)}
            title={icoClass[playOrder.value].title}
            onClick={switchPlayOrder}
          ></span>
          <span class="add f-pr">
            <em
              class="icn icn-list s-fc3"
              title="播放列表"
              onClick={() => (showPanel.value = !showPanel.value)}
            >
              {recordNumber.value}
            </em>
          </span>
        </div>
      )
    }
  },
})

// 展开/收起按钮
export const UpDownCtrl = defineComponent({
  setup() {
    return () => {
      return (
        <div class="updn">
          <div class="left f-fl">
            <span class="btn"></span>
          </div>
          <div class="right f-fl"></div>
        </div>
      )
    }
  },
})

// 其余装饰部分
export const DecoratedElements = () => {
  return (
    <>
      <div class="bg"></div>
      <div class="hand" title="展开播放条"></div>
    </>
  )
}

// 播放组件容器
export const PlayBarWrap = ({ renderContent }) => {
  return (
    <section class="g-btmbar">
      <div class="m-playbar m-playbar-lock">{renderContent()}</div>
    </section>
  )
}

// 媒体组件
export const Audio = defineComponent({
  name: 'audio',
  props: {
    errorReport: {
      type: Function,
      default: () => {},
    },
  },
  emits: ['end'],
  setup({ errorReport }, { emit }) {
    const id: Ref<number> = inject('curId')
    const isLoading: Ref<boolean> = inject('isLoading')
    const { dataSource: url, reload, isFetching } = useSongUrl(id)

    watchEffect(() => {
      if (!isFetching.value) {
        setTimeout(() => {
          isLoading.value = isFetching.value
        }, 1000)
      } else {
        isLoading.value = isFetching.value
      }
    })

    const playState: Ref<boolean> = inject('playState')
    // 获取真实audio节点
    const audioRef = ref()
    onMounted(() => {
      audioRef.value = document.querySelector('#audio')
    })

    function play() {
      audioRef.value.play()
    }

    function pause() {
      audioRef.value.pause()
    }

    // 错误处理
    function errorHandler(e: ErrorEvent) {
      //可以错误上报
      errorReport(e)
      // 重新加载
      const memoTime = curTime.value
      reload().then(() => {
        jumpToTime(memoTime)
      })
    }

    // 缓冲进度
    const buffered: Ref<string> = inject('buffered')
    function progresHandler() {
      const timeRanges = audioRef.value.buffered
      // 获取已缓存的时间
      const val = (timeRanges.end(timeRanges.length - 1) / fullTime.value) * 100
      buffered.value = val.toFixed(1) + '%'
    }

    // 加载完成
    const fullTime: Ref<number> = inject('fullTime')
    function loadedHandler() {
      fullTime.value = Math.ceil(audioRef.value.duration)
    }

    // 时间更新
    const curTime: Ref<number> = inject('curTime')
    function updateHandler() {
      const currentTime = Math.round(audioRef.value.currentTime)
      curTime.value = currentTime
    }

    function jumpToTime(time: number) {
      //播放到指定时间
      audioRef.value.currentTime = time
    }

    // 能否无阻播放
    function isThroughHandler() {
      console.log('through')
      if (playState.value) {
        play()
      }
    }

    // 播放结束
    const playOrder: Ref<number> = inject('playOrder')
    function endHandler() {
      emit('end')
      if (playOrder.value === 2) {
        play()
      }
    }

    return {
      audioRef,
      url,
      play,
      pause,
      jumpToTime,
      errorHandler,
      progresHandler,
      loadedHandler,
      updateHandler,
      isThroughHandler,
      endHandler,
    }
  },
  render() {
    return (
      <audio
        id="audio"
        src={this.url}
        onError={this.errorHandler}
        onProgress={this.progresHandler}
        onDurationchange={this.loadedHandler}
        onTimeupdate={this.updateHandler}
        onCanplaythrough={this.isThroughHandler}
        onEnded={this.endHandler}
      ></audio>
    )
  },
})

// 歌词面板
const LrcPanel = defineComponent({
  name: 'LrcPanel',
  setup() {
    const curId: Ref<number> = inject('curId')
    const curTime: Ref<number> = inject('curTime')
    const lrc: Ref<Array<LrcItem>> = useLrc(curId)
    const lrcRef: Ref<HTMLElement> = ref()

    // id变化，回到顶部
    watch(curId, () => {
      lrcRef.value.scroll({
        top: 0,
        behavior: 'smooth',
      })
    })

    // 根据当前时间，滑动到对应位置
    watch(curTime, () => {
      if (isWheeling.value) return
      lrcRef.value.getElementsByTagName('p')[activeIdx.value].scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    })

    // 当前激活的歌词下标
    const activeIdx = computed(() => {
      const idx = lrc.value.findIndex((item) => item.time > curTime.value)
      if (idx === 0) {
        return 0
      } else if (idx > -1) {
        return idx - 1
      } else {
        return lrc.value.length - 1
      }
    })

    // 滚轮控制
    const isWheeling = ref(false)
    let timer: number
    function wheelHandler() {
      console.log('wheel')
      isWheeling.value = true
      timer && clearTimeout(timer)
      timer = setTimeout(() => {
        isWheeling.value = false
        timer = null
      }, 3000)
    }

    return () => {
      return (
        <div class="listlyric j-flag" ref={lrcRef} onWheel={wheelHandler}>
          {lrc.value.map(({ time, txt }, i) => {
            return (
              <p
                class={classNames('j-flag', {
                  'z-sel': i === activeIdx.value,
                })}
                data-time="0"
                key={time}
              >
                {txt}
              </p>
            )
          })}
        </div>
      )
    }
  },
})

export const PlayPanel = defineComponent({
  name: 'PlayPanel',
  setup() {
    const showPanel: Ref<boolean> = inject('showPanel')
    const historyRecord: Ref<Array<SongItem>> = inject('historyRecord')
    const recordNumber = computed(() => historyRecord.value.length)
    const curId: Ref<number> = inject('curId')
    const curInfo: SongItem = useCurrentInfo(curId, historyRecord)

    return () => {
      return (
        <Transition name="fade">
          <div class="list" v-show={showPanel.value}>
            <img
              src={`${curInfo.picUrl}?param=34y34?param=34y34?imageView&blur=3x3`}
              class="imgbg j-flag"
              alt=""
            />
            <div class="listhd">
              <div class="listhdc">
                <h4>
                  播放列表(<span class="j-flag">{recordNumber.value}</span>)
                </h4>
                <span class="addall">
                  <i class="ico ico-add"></i>
                  收藏全部
                </span>
                <span class="line"></span>
                <span class="clear">
                  <i class="ico icn-del"></i>
                  清除
                </span>
                <div class="lytit f-ff0 f-thide j-flag">{curInfo?.name}</div>
                <span class="close" onClick={() => (showPanel.value = false)}>
                  关闭
                </span>
              </div>
            </div>
            <div class="listbd">
              <PlayListGroup />
              <div class="bline j-flag"></div>
              <LrcPanel />
            </div>
          </div>
        </Transition>
      )
    }
  },
})

const PlayListGroup = defineComponent({
  setup() {
    const playRecord = inject('historyRecord')
    return {
      playRecord,
    }
  },
  render() {
    return (
      <div class="listbdc j-flag">
        <ul class="f-cb">{renderRecordList(this.playRecord)}</ul>
      </div>
    )
  },
})

function renderRecordList(record: Array<SongItem>) {
  return record.map((item) => (
    <PlayItem {...item} artists={item.ar} duration={item.dt} key={item.id} />
  ))
}

const PlayItem = defineComponent({
  name: 'PlayItem',
  inheritAttrs: false,
  props: {
    name: { type: String, required: true },
    artists: Array,
    duration: Number,
    id: { type: Number, required: true },
  },
  setup({ name, artists, duration, id }) {
    const art = useArtists(artists)
    const { fullTime } = useTime(duration)
    const curId: Ref<number> = inject('curId')
    const playRecord: Ref<Array<SongItem>> = inject('historyRecord')
    function deleteHandler(id: number, e: MouseEvent) {
      e.stopPropagation()
      const idx = playRecord.value.findIndex((item) => item.id === id)
      playRecord.value.splice(idx, 1)
    }
    function downLoadHandler(id: number, name: string, e: MouseEvent) {
      e.stopPropagation()
      useDownLoadSong(id, name)
    }
    return () => {
      return (
        <li
          class={classNames({ 'z-sel': curId.value === id })}
          onClick={() => (curId.value = id)}
        >
          <div class="col col-1">
            {curId.value === id && <div class="playicn"></div>}
          </div>
          <div class="col col-2">{name}</div>
          <div class="col col-3">
            <div class="icns">
              <i
                class="ico icn-del"
                title="删除"
                onClick={(e) => deleteHandler(id, e)}
              ></i>
              <i
                class="ico ico-dl"
                title="下载"
                onClick={(e) => downLoadHandler(id, name, e)}
              ></i>
              <i class="ico ico-share" title="分享"></i>
              <i class="j-t ico ico-add" title="收藏"></i>
            </div>
          </div>
          <div class="col col-4">
            <span title={art}>{art}</span>
          </div>
          <div class="col col-5">{fullTime.value}</div>
          <div class="col col-6">
            <i class="ico ico-src"></i>
          </div>
        </li>
      )
    }
  },
})
