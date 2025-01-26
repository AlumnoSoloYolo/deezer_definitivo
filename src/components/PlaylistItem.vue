<template>
  <div class="list-group-item d-flex justify-content-between align-items-center">
    <div class="d-flex align-items-center">
      <img :src="song.album.cover_small" class="me-3" :alt="song.title">
      <div>
        <h5 class="mb-0">{{ song.title }}</h5>
        <small>{{ song.artist.name }}</small>
      </div>
    </div>
    <div class="d-flex align-items-center">
      <button 
        class="btn btn-sm btn-primary me-2" @click="playSong" >
        <i class="bi bi-play-fill"></i>
      </button>
      <button class="btn btn-sm btn-danger" @click="$emit('remove', song.id)">
        <i class="bi bi-trash"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePlayerStore } from '@/stores/player'

const props = defineProps(['song'])
const emit = defineEmits(['remove', 'play'])
const playerStore = usePlayerStore()

const isPlayable = computed(() => {
  return props.song?.preview && 
         typeof props.song.preview === 'string' && 
         props.song.preview.startsWith('http')
})

const playSong = () => {
  if (!isPlayable.value) {
    console.error('Canción no reproducible:', props.song)
    return
  }

  try {
    playerStore.playSong(props.song)
    emit('play', props.song)
  } catch (error) {
    console.error('Error al reproducir la canción:', error)
  }
}
</script>