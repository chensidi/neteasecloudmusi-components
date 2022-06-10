<script setup lang="ts">
import { PlayBar } from '../cloud-components'
import { onMounted, ref, watch } from 'vue';
import { useFetch } from '@vueuse/core';

const playRef = ref()
// 188261, 211170, 188259
onMounted(() => {
  console.log(playRef.value)
})

const kw = ref('爱与交响曲张学友')

const songs = ref([])


async function query() {
  const { data } = await useFetch('http://zhoup.top:7003/search?keywords=' + kw.value)
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
