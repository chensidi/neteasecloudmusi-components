interface artist {
  name: string
  id: number
}

export interface SongItem {
  name: string
  ar: Array<artist>
  dt: number
  picUrl: string
  id: number
}

export interface LrcItem {
  time: number
  txt: string
}
