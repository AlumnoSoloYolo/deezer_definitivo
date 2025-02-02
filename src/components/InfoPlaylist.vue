<!-- PlaylistInfo.vue -->
<template>

<SearchBar :initialQuery="$route.query.q || ''" />
    <div class="playlist-info">
      <div v-if="loading" class="loading">
        <p>Cargando playlist...</p>
      </div>
      
      <template v-else-if="playlist">
        <!-- Header de la playlist -->
        <div class="playlist-header">
          <div class="cover-container">
            <img :src="playlist.picture_big" :alt="playlist.title">
          </div>
          <div class="info-container">
            <span class="playlist-type">Playlist</span>
            <h1>{{ playlist.title }}</h1>
            <p class="description">{{ playlist.description }}</p>
            <div class="playlist-stats">
              <span>{{ playlist.nb_tracks }} canciones</span>
              <span>{{ formatDuration(playlist.duration) }} min</span>
              <span>{{ playlist.fans.toLocaleString() }} fans</span>
            </div>
            <div class="creator-info">
              <p>Creado por {{ playlist.creator.name }}</p>
            </div>
          </div>
        </div>
  
        <!-- Lista de canciones -->
        <div class="songs-list">
          <div class="songs-header">
            <div class="header-row">
              <div class="header-cell">#</div>
              <div class="header-cell">Título</div>
              <div class="header-cell">Artista</div>
              <div class="header-cell hide-mobile">Álbum</div>
              <div class="header-cell">Duración</div>
            </div>
          </div>
  
          <div class="songs-body">
            <div v-for="(track, index) in playlist.tracks.data" 
                 :key="track.id"
                 class="song-row"
                 :class="{ 
                   'playing': playerStore.currentSong?.id === track.id,
                   'not-readable': !track.readable 
                 }"
                 @dblclick="track.readable && playSong(track)">
              <div class="song-cell number">
                <span class="index">{{ index + 1 }}</span>
                <button v-if="track.readable" 
                        class="play-btn"
                        @click="playSong(track)">
                  <i :class="playerStore.currentSong?.id === track.id ? 'bi bi-pause-fill' : 'bi bi-play-fill'"></i>
                </button>
              </div>
              <div class="song-cell title">
                <img :src="track.album.cover_small" :alt="track.title">
                <div class="song-info">
                  <span :class="{ 'text-muted': !track.readable }">{{ track.title }}</span>
                  <span v-if="track.explicit_lyrics" class="explicit-badge">E</span>
                </div>
              </div>
              <div class="song-cell artist">
                <router-link :to="'/artist/' + track.artist.id">
                  {{ track.artist.name }}
                </router-link>
              </div>
              <div class="song-cell album hide-mobile">
                <router-link :to="'/album/' + track.album.id">
                  {{ track.album.title }}
                </router-link>
              </div>
              <div class="song-cell duration">
                <div class="song-actions" v-if="track.readable">
                  <button 
                    class="action-btn favorite"
                    @click="handleFavorite(track)"
                    :class="{ 'is-favorite': favoritesStore.isFavorite(track.id) }">
                    <i :class="favoritesStore.isFavorite(track.id) ? 'bi bi-heart-fill' : 'bi bi-heart'"></i>
                  </button>
                  <button class="action-btn" @click="addToQueue(track)">
                    <i class="bi bi-plus"></i>
                  </button>
                </div>
                <span class="time">{{ formatDuration(track.duration) }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
  
      <div v-else-if="error" class="error-message">
        {{ error }}
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { usePlayerStore } from '../stores/player'
  import { useFavoritesStore } from '../stores/favorites'
  import SearchBar from './SearchBar.vue'
  
  const route = useRoute()
  const router = useRouter()
  const playerStore = usePlayerStore()
  const favoritesStore = useFavoritesStore()
  
  const playlist = ref(null)
  const loading = ref(true)
  const error = ref(null)
  
  const formatDuration = (seconds) => {
    if (!seconds) return '0:00'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  
  const playSong = (song) => {
    if (!song.readable) return
    playerStore.playSong(song)
  }
  
  const addToQueue = (song) => {
    if (!song.readable) return
    playerStore.addToQueue(song)
  }
  
  const handleFavorite = (song) => {
    if (favoritesStore.isFavorite(song.id)) {
      favoritesStore.removeSong(song.id)
    } else {
      favoritesStore.addSong(song)
    }
  }
  
  onMounted(async () => {
    try {
      const response = await fetch(`http://localhost:8080/https://api.deezer.com/playlist/${route.params.id}`)
      const data = await response.json()
      if (data.error) {
        throw new Error(data.error.message || 'Error al cargar la playlist')
      }
      playlist.value = data
    } catch (err) {
      console.error('Error al cargar la playlist:', err)
      error.value = 'No se pudo cargar la playlist'
    } finally {
      loading.value = false
    }
  })
  </script>
  
  <style lang="scss" scoped>
  .playlist-info {
    padding: 2rem;
  }
  
  .loading, .error-message {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
  }
  
  .error-message {
    color: #dc3545;
  }
  
  .playlist-header {
    display: flex;
    gap: 2rem;
    margin-bottom: 3rem;
  
    .cover-container {
      width: 232px;
      height: 232px;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 60px rgba(0,0,0,0.5);
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  
    .info-container {
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
  
      .playlist-type {
        font-size: 0.9rem;
        text-transform: uppercase;
        color: #666;
      }
  
      h1 {
        font-size: 3rem;
        margin: 0.5rem 0;
        font-weight: 700;
      }
  
      .description {
        color: #666;
        font-size: 1rem;
        margin: 0.5rem 0;
      }
  
      .playlist-stats {
        margin-top: 0.5rem;
        span {
          margin-right: 1rem;
          color: #666;
        }
      }
  
      .creator-info {
        margin-top: 1rem;
        color: #666;
        font-size: 0.9rem;
      }
    }
  }
  
  .songs-list {
    margin-top: 2rem;
  
    .songs-header {
      color: #666;
      font-size: 0.9rem;
      border-bottom: 1px solid #E1DDE4;
    }
  
    .header-row, .song-row {
      display: grid;
      grid-template-columns: 50px 3fr 2fr 2fr 1fr;
      align-items: center;
      padding: 0.8rem;
    }
  
    .song-row {
      border-radius: 8px;
      transition: all 0.2s;
  
      &:hover {
        background-color: #F5F2F8;
  
        .song-actions {
          opacity: 1;
        }
  
        .index {
          display: none;
        }
  
        .play-btn {
          display: flex;
        }
      }
  
      &.playing {
        background-color: #F5F2F8;
      }
  
      &.not-readable {
        opacity: 0.5;
      }
  
      .number {
        position: relative;
        width: 40px;
  
        .index {
          display: block;
        }
  
        .play-btn {
          display: none;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #A238FF;
          font-size: 1.2rem;
        }
      }
  
      .title {
        display: flex;
        align-items: center;
        gap: 1rem;
  
        img {
          width: 40px;
          height: 40px;
          border-radius: 4px;
        }
  
        .song-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
  
        .explicit-badge {
          background-color: #666;
          color: white;
          padding: 0.1rem 0.3rem;
          border-radius: 3px;
          font-size: 0.8rem;
        }
      }
  
      .artist, .album {
        a {
          color: inherit;
          text-decoration: none;
          
          &:hover {
            text-decoration: underline;
          }
        }
      }
  
      .duration {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 1rem;
      }
    }
  }
  
  .song-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    opacity: 0;
    transition: opacity 0.2s;
  
    .action-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: none;
      background: transparent;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
  
      &:hover {
        background-color: #EBE7EE;
      }
  
      &.favorite {
        &.is-favorite i {
          color: #E85E38;
        }
      }
  
      i {
        font-size: 1.2rem;
        color: #A238FF;
      }
    }
  }
  
  .text-muted {
    color: #666;
  }
  
  @media (max-width: 768px) {
    .playlist-header {
      flex-direction: column;
      gap: 1rem;
  
      .cover-container {
        width: 180px;
        height: 180px;
        margin: 0 auto;
      }
  
      .info-container {
        text-align: center;
  
        h1 {
          font-size: 2rem;
        }
      }
    }
  
    .hide-mobile {
      display: none;
    }
  
    .song-row {
      grid-template-columns: 50px 3fr 2fr 1fr !important;
    }
  }
  </style>