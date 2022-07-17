import { computed, ref, watch, Ref, ComputedRef, reactive, nextTick } from 'vue'
import { useFetch, useStorage, createFetch } from '@vueuse/core'
import Clipboard from 'clipboard'
import { ElMessage } from 'element-plus'
import 'element-plus/dist/index.css'

import { timeFormat, downRow, formatLrc } from './utils/tools'
import { baseUrl } from './constant'
import { SongItem } from './play-bar/types'

function useTime(timeStamp: number | Ref<number>) {
  const curTime = ref('00: 00')
  let fullTime
  if (typeof timeStamp === 'number') {
    fullTime = ref(timeFormat(timeStamp))
  } else {
    fullTime = computed(() => timeFormat(timeStamp.value))
  }

  function setCurTime(timeStamp: number) {
    curTime.value = timeFormat(timeStamp)
  }

  return {
    curTime,
    fullTime,
    setCurTime,
  }
}

function useArtists<T, K extends keyof T>(ar: Array<T>, attr: string = 'name') {
  const artistsArr = ar.map((item) => {
    return item[attr as K]
  })

  return artistsArr.join('/')
}

// 获取歌曲url
function useSongUrl(id: Ref<string | number>) {
  const url: ComputedRef<string> = computed(
    () => `${baseUrl}/song/url?id=${id.value}`
  )
  const {
    isFetching,
    data,
    error,
    execute: reload,
  } = useFetch(url, {
    refetch: true,
    immediate: true,
  })
  const dataSource = ref()
  watch(data, (now) => {
    if (now) {
      dataSource.value = JSON.parse(data.value as string)?.data[0]?.url
    }
  })
  return {
    isFetching,
    error,
    dataSource,
    reload,
  }
}

// 歌曲详情
function useSongInfo(id: Ref<number | string>) {
  const url: ComputedRef<string> = computed(
    () => `${baseUrl}/song/detail?ids=${id.value}`
  )
  const { data } = useFetch(url, {
    refetch: true,
    immediate: true,
  })
  const info: {
    name: string
    picUrl: string
    ar: Array<any>
    dt: number
    id: number
  } = reactive({
    name: '',
    picUrl: '',
    ar: [],
    dt: 0,
    id: 0,
  })
  watch(data, (now) => {
    if (now) {
      const {
        name,
        al: { picUrl },
        ar,
        dt,
        id,
      } = JSON.parse(data.value as string)?.songs[0]
      Object.assign(info, {
        name,
        picUrl,
        ar,
        dt: parseInt(String(dt / 1000)),
        id,
      })
    }
  })
  return {
    info,
  }
}

function usePlayRecord() {
  const state = useStorage('playRecord', [])
  return state as Ref<Array<SongItem>>
}

function usePlayOrder() {
  const order = useStorage('playOrder', 0)
  return order
}

function useCurId() {
  const curId = useStorage('curId', NaN)
  return curId
}

async function useDownLoadSong(id: number, name: string) {
  const url = `${baseUrl}/song/url?id=${id}`
  const { data } = await useFetch(url)
  const songSrc = JSON.parse(data.value as string)?.data[0]?.url
  downRow(songSrc, name)
}

function useLrc(id: Ref<number>) {
  const url: ComputedRef<string> = computed(
    () => `${baseUrl}/lyric?id=${id.value}`
  )
  const { data } = useFetch(url, {
    refetch: true,
    immediate: true,
  })

  const lrc = ref('')
  watch(data, (now) => {
    if (now) {
      lrc.value = JSON.parse(data.value as string)?.lrc?.lyric
    }
  })

  const lrcArr = computed(() => formatLrc(lrc.value))
  return lrcArr
}

const useMyFetch = createFetch({
  baseUrl: `${baseUrl}`, // 基础路由
  options: {
    immediate: true, // 是否在使用 useMyFetch 时自动运行 (推荐手动运行)
    timeout: 30000, // 请求过期时间
  },
  fetchOptions: {
    mode: 'cors',
    credentials: 'include', // 请求时携带 cookie 值
  },
})

function useCurrentInfo(
  curId: Ref<number>,
  record: Ref<Array<SongItem>>
): SongItem {
  const info = reactive({} as SongItem)
  const item = record.value.find((item) => item.id === curId.value)
  Object.assign(info, { ...item })
  watch(
    [curId, record],
    () => {
      console.log(record, curId)
      const item = record.value.find((item) => item.id == curId.value)
      console.log('找到的对象', item)
      item && Object.assign(info, { ...item })
    },
    {
      immediate: true,
      deep: true,
    }
  )
  return info
}

function useScrollList() {
  nextTick(() => {
    document.querySelector('li.z-sel')?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
  })
}

// 复制文本
function useCopyText(text: string): void
function useCopyText(asyncHandler: () => Promise<string>): void
async function useCopyText(arg: string | (() => Promise<string>)) {
  const hdBtn = document.createElement('button')
  hdBtn.style.display = 'none'
  document.body.appendChild(hdBtn)
  let text = ''
  if (typeof arg === 'string') {
    text = arg
  } else {
    text = await arg()
  }
  const clipboard = new Clipboard(hdBtn, {
    text() {
      return text
    },
  }).on('success', () => {
    ElMessage.success(`复制链接成功：${text}`)
  })
  hdBtn.click()
  clipboard.destroy()
  document.body.removeChild(hdBtn)
}

export {
  useTime,
  useSongUrl,
  useSongInfo,
  useArtists,
  usePlayRecord,
  useDownLoadSong,
  useMyFetch,
  useLrc,
  useCurrentInfo,
  usePlayOrder,
  useCurId,
  useScrollList,
  useCopyText,
}
