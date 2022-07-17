export function setImgSize(url, w, h) {
  return url + `?imageView&thumbnail=${w}y${h}&quality=75&tostatic=0`
}

export function resolveArtists(artists = []) {
  const artistsArr = artists.map((item) => item.name)
  return artistsArr.join('/')
}

export function formatLrc(lrc) {
  //歌词转数组
  if (typeof lrc !== 'string') return []
  let split1 = lrc.split('[')
  split1.shift()
  let split2 = []
  split1.map((item) => {
    let temp = item.split(']')
    let time = temp[0]
    time = time.split(':')
    time = parseInt(time[0]) * 60 + Math.round(time[1])
    if (temp[1].trim() != '') {
      //排除空歌词
      split2.push({
        time,
        txt: temp[1],
      })
    }
  })
  if (!split2.length) {
    split2 = formatPureLrc(lrc)
  }
  return split2
}

function formatPureLrc(lrc) {
  //没有时间戳的歌词
  return lrc.split('\n').map((item) => {
    return { txt: item }
  })
}

export function timeFormat(allSeconds, formatter = 'mm-ss', slipter = ':') {
  let [hours, minutes, seconds] = [
    Math.floor(allSeconds / 3600),
    Math.floor((allSeconds % 3600) / 60),
    (allSeconds % 3600) % 60,
  ]
  let formatterArr = formatter.split('-')
  const res = formatterArr.map((itm) => {
    if (itm === 'hh') {
      return hours.toString().padStart(2, '0')
    }
    if (itm === 'h') {
      return hours.toString()
    }
    if (itm === 'mm') {
      return minutes.toString().padStart(2, '0')
    }
    if (itm === 'm') {
      return minutes.toString()
    }
    if (itm === 'ss') {
      return seconds.toString().padStart(2, '0')
    }
    if (iem === 's') {
      return seconds.toString()
    }
  })
  return res.join(slipter)
}

export function getNextSong(id, list, flag) {
  console.log(id)
  let idx = list.findIndex((itm) => itm.id == id)
  flag ? idx++ : idx--
  if (idx >= list.length) {
    //边界处理
    idx = 0
  }
  if (idx < 0) {
    idx = list.length - 1
  }
  const nextSong = list[idx]
  return nextSong
}

export function playSong(song, reactiveCurInfo) {
  Object.entries(song).map(([k, v]) => {
    reactiveCurInfo[k] = v
  })
}

export function isSongExist(id, list) {
  const res = list.some((item) => item.id === id)
  return res
}

export function downRow(url, name) {
  let ajax = new XMLHttpRequest()
  ajax.open('GET', url, true)
  ajax.responseType = 'blob'
  //ajx.withCredentials = true;//如果跨域
  ajax.onload = function (oEvent) {
    let content = ajax.response
    let a = document.createElement('a')
    a.download = `${name}.mp3`
    a.style.display = 'none'
    let blob = new Blob([content])
    a.href = URL.createObjectURL(blob)
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }
  ajax.send()
}

// 顺序播放
export function loopOrder(id, list, flag) {
  const idx = list.findIndex((item) => item.id === id)
  if (flag) {
    if (idx === list.length - 1) {
      return list[0].id
    }
    return list[idx + 1].id
  }
  if (!flag) {
    if (idx === 0) {
      return list[list.length - 1].id
    }
    return list[idx - 1].id
  }
}

// 随机播放
export function shuffleOrder(list) {
  const newList = [...list]
  newList.sort((a, b) => 0.5 - Math.random())
  return function (id, flag) {
    return loopOrder(id, newList, flag)
  }
}
