<!-- SongCard.vue -->
<template>
    <div 
      class="song-row"
      :class="{ 
        'playing': playerStore.currentSong?.id === song.id && playerStore.isPlaying,
        'not-readable': !song.readable 
      }"
      @dblclick="song.readable && togglePlay(song)"
    >
      <!-- Número y botón play -->
      <div class="number">
        <span class="index">{{ index + 1 }}</span>
        <button 
          v-if="song.readable" 
          class="play-btn"
          @click.stop="togglePlay(song)"
          :class="{ 'is-playing': playerStore.currentSong?.id === song.id && playerStore.isPlaying }"
        >
          <i :class="[
            'bi',
            playerStore.currentSong?.id === song.id && playerStore.isPlaying 
              ? 'bi-pause-fill' 
              : 'bi-play-fill'
          ]"></i>
        </button>
      </div>
  
      <!-- Título con imagen y detalles -->
      <div class="title">
        <div class="image-container">
          <img 
            :src="song.album?.cover_small" 
            :alt="song.title" 
            class="song-album-image"
          >
          <button 
            v-if="song.readable" 
            class="overlay-play-btn"
            @click.stop="togglePlay(song)"
          >
            <i :class="[
              'bi',
              playerStore.currentSong?.id === song.id && playerStore.isPlaying 
                ? 'bi-pause-fill' 
                : 'bi-play-fill'
            ]"></i>
          </button>
        </div>
        <div class="song-info">
          <div class="song-title-wrapper">
            <router-link 
              :to="`/song/${song.id}`" 
              class="song-title-link"
            >
              {{ song.title }}
            </router-link>
            <span v-if="song.explicit_lyrics" class="explicit-badge">E</span>
          </div>
          <div class="song-details">
            <router-link :to="`/artist/${song.artist.id}`">
              {{ song.artist.name }}
            </router-link>
            <span class="separator">•</span>
            <router-link :to="`/album/${song.album.id}`">
              {{ song.album.title }}
            </router-link>
          </div>
        </div>
      </div>
  
      <!-- Artista columna -->
      <div class="artist">
        <router-link :to="`/artist/${song.artist.id}`">
          {{ song.artist.name }}
        </router-link>
      </div>
  
      <!-- Álbum columna -->
      <div class="album album-cell">
        <router-link :to="`/album/${song.album.id}`">
          {{ song.album.title }}
        </router-link>
      </div>
  
      <!-- Acciones y duración -->
      <div class="actions">
        <div class="song-actions">
          <button 
            class="action-btn favorite"
            @click="handleFavorite"
            :class="{ 'is-favorite': isFavorite }"
          >
            <i :class="isFavorite ? 'bi bi-heart-fill' : 'bi bi-heart'"></i>
          </button>
          <button class="action-btn" @click.stop="addToQueue">
            <i class="bi bi-plus"></i>
          </button>
        </div>
        <span class="duration">{{ formatDuration(song.duration) }}</span>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  import { usePlayerStore } from '@/stores/player'
  import { useFavoritesStore } from '@/stores/favorites'
  
  const props = defineProps({
    song: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      required: true
    }
  })
  
  const playerStore = usePlayerStore()
  const favoritesStore = useFavoritesStore()
  
  const isFavorite = computed(() => favoritesStore.isFavorite(props.song.id))
  
  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  
  const togglePlay = () => {
    if (!props.song.readable) return
  
    if (playerStore.currentSong?.id === props.song.id) {
      playerStore.togglePlay()
      return
    }
  
    playerStore.playSong(props.song)
  }
  
  const handleFavorite = () => {
    if (isFavorite.value) {
      favoritesStore.removeSong(props.song.id)
    } else {
      favoritesStore.addSong(props.song)
    }
  }
  
  const addToQueue = () => {
    if (!props.song.readable) return
    playerStore.addToQueue(props.song)
  }
  </script>