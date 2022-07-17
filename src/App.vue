<script setup lang="ts">
import { PlayBar } from '../cloud-components'
import { onMounted, ref, watch } from 'vue'
import { useFetch } from '@vueuse/core'

const playRef = ref()
// 188261, 211170, 188259
onMounted(() => {
  console.log(playRef.value)
})

const kw = ref('爱与交响曲张学友')
const type = ref(1)

const songs = ref([])

async function query() {
  const { data } = await useFetch(
    `http://zhoup.top:7003/search?keywords=${kw.value}&type=${type.value}`
  )
  const res = JSON.parse(data.value as string).result.songs
  songs.value = res
}

const curId = ref()
function selectHandler(id: number) {
  curId.value = id
  console.log(id)
}
</script>

<template>
  <PlayBar ref="playRef" :id="curId" />
  <input type="text" v-model="kw" />
  <button @click="query">查询</button>
  <radio-group @change="">
    <label>
      单曲
      <input type="radio" name="search" value="1" v-model="type" />
    </label>
    <label>
      专辑
      <input type="radio" name="search" value="10" v-model="type" />
    </label>
  </radio-group>
  <div class="result-wrap">
    <p v-for="item of songs" @click="selectHandler(item.id)">{{ item.name }}</p>
  </div>
</template>

<style>
p {
  cursor: pointer;
}
.result-wrap {
  width: 50%;
}
</style>
