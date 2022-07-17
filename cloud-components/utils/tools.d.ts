import { SongItem } from '../types'
import { formatterFlag, LrcItem } from './types'

export const isSongExist: (id: number, list: Array<SongItem>) => boolean
export const loopOrder: (
  id: number,
  list: Array<SongItem>,
  flag: boolean
) => number
export const shuffleOrder: (
  list: Array<SongItem>
) => (id: number, flag: boolean) => number

export const timeFormat: (
  allSeconds: number,
  formatter?: formatterFlag,
  slipter?: string
) => string

export const downRow: (url: string, name: string) => void

export const formatLrc: (lrc: string) => LrcItem[]
