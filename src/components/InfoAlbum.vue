<template>
  <SearchBar :initialQuery="$route.query.q || ''" />
  <div class="album-info">
    <div v-if="loading" class="loading">
      <p>Cargando álbum...</p>
    </div>
    
    <template v-else-if="album">
      <!-- Cabecera del álbum -->
      <div class="album-header">
        <div class="cover-container">
          <img :src="album.cover_big || album.cover_xl" :alt="album.title">
        </div>
        <div class="info-container">
          <span class="album-type">Álbum</span>
          <h1>{{ album.title }}</h1>
          <div class="album-meta">
            <router-link :to="'/artist/' + album.artist.id" class="artist-link">
              <img :src="album.artist.picture_small" :alt="album.artist.name">
              <span>{{ album.artist.name }}</span>
            </router-link>
            <div class="stats">
              <span>{{ new Date(album.release_date).getFullYear() }}</span>
              <span class="dot">•</span>
              <span>{{ album.nb_tracks }} canciones</span>
              <span class="dot">•</span>
              <span>{{ formatDuration(album.duration) }}</span>
            </div>
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
            <div class="header-cell text-right">
              <i class="bi bi-clock"></i>
            </div>
          </div>
        </div>

        <div class="songs-body">
          <div v-for="(track, index) in album.tracks.data" 
               :key="track.id"
               class="song-row"
               :class="{ 
                 'playing': playerStore.currentSong?.id === track.id && playerStore.isPlaying,
                 'not-readable': !track.readable 
               }"
               @dblclick="track.readable && togglePlay(track)">
            <div class="number">
              <span class="index">{{ index + 1 }}</span>
              <button v-if="track.readable" 
                      class="play-btn"
                      @click.stop="togglePlay(track)"
                      :class="{ 'is-playing': playerStore.currentSong?.id === track.id && playerStore.isPlaying }">
                <i :class="[
                  'bi',
                  playerStore.currentSong?.id === track.id && playerStore.isPlaying 
                    ? 'bi-pause-fill' 
                    : 'bi-play-fill'
                ]"></i>
              </button>
            </div>
            <div class="title">
              <div class="song-info">
                <img :src="track.album.cover_small" :alt="track.title">
                <span :class="{ 'text-muted': !track.readable }">{{ track.title }}</span>
                <span v-if="track.explicit_lyrics" class="explicit-badge">E</span>
              </div>
            </div>
            <div class="artist">
              <router-link :to="'/artist/' + track.artist.id">
                {{ track.artist.name }}
              </router-link>
            </div>
            <div class="actions">
              <div class="song-actions">
                <button 
                  v-if="track.readable" 
                  class="action-btn play"
                  @click.stop="togglePlay(track)"
                >
                  <i :class="[
                    'bi',
                    {
                      'bi-pause-fill': playerStore.currentSong?.id === track.id && playerStore.isPlaying,
                      'bi-play-fill': playerStore.currentSong?.id !== track.id || !playerStore.isPlaying
                    }
                  ]"></i>
                </button>
                <button 
                  class="action-btn favorite"
                  @click="handleFavorite(track)"
                  :class="{ 'is-favorite': favoritesStore.isFavorite(track.id) }"
                >
                  <i :class="favoritesStore.isFavorite(track.id) ? 'bi bi-heart-fill' : 'bi bi-heart'"></i>
                </button>
                <button class="action-btn" @click="addToQueue(track)">
                  <i class="bi bi-plus"></i>
                </button>
              </div>
              <span class="duration">{{ formatDuration(track.duration) }}</span>
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
import { useRoute } from 'vue-router'
import { usePlayerStore } from '../stores/player'
import { useFavoritesStore } from '../stores/favorites'
import SearchBar from './SearchBar.vue'

const route = useRoute()
const playerStore = usePlayerStore()
const favoritesStore = useFavoritesStore()

const album = ref(null)
const loading = ref(true)
const error = ref(null)

const formatDuration = (seconds) => {
  if (!seconds) return '0:00'
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const togglePlay = (song) => {
  if (!song.readable) return

  // Si es la misma canción que está sonando, solo toggleamos play/pause
  if (playerStore.currentSong?.id === song.id) {
    playerStore.togglePlay()
    return
  }

  // Si es una nueva canción, preparamos la cola y reproducimos
  const allTracks = album.value.tracks.data
  const currentIndex = allTracks.findIndex(track => track.id === song.id)
  const nextSongs = allTracks.slice(currentIndex + 1).filter(track => track.readable)

  // Iniciamos la reproducción
  playerStore.playSong(song)
  playerStore.setQueue(nextSongs)
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
    const response = await fetch(`http://localhost:8080/https://api.deezer.com/album/${route.params.id}`)
    const data = await response.json()
    if (data.error) {
      throw new Error(data.error.message || 'Error al cargar el álbum')
    }
    album.value = data
  } catch (err) {
    console.error('Error al cargar el álbum:', err)
    error.value = 'No se pudo cargar el álbum'
  } finally {
    loading.value = false
  }
})
</script>

<style lang="scss" scoped>
.album-info {
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

.album-header {
  display: flex;
  gap: 2rem;
  margin-bottom: 3rem;

  .cover-container {
    width: 232px;
    height: 232px;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 60px rgba(0,0,0,0.3);
    
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

    .album-type {
      font-size: 0.9rem;
      text-transform: uppercase;
      color: #666;
    }

    h1 {
      font-size: 3rem;
      margin: 0.5rem 0;
      font-weight: 700;
    }

    .album-meta {
      margin-top: 1rem;

      .artist-link {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        text-decoration: none;
        color: inherit;
        font-weight: 600;
        margin-bottom: 0.5rem;
        
        &:hover {
          text-decoration: underline;
        }

        img {
          width: 28px;
          height: 28px;
          border-radius: 50%;
        }
      }

      .stats {
        color: #666;
        display: flex;
        align-items: center;
        gap: 0.5rem;

        .dot {
          margin: 0 0.2rem;
        }
      }
    }
  }
}

.songs-list {
  margin-top: 2rem;

  .songs-header {
    color: #666;
    font-size: 0.9rem;
    text-transform: uppercase;
    border-bottom: 1px solid #E1DDE4;
    
    .header-row {
      display: grid;
      grid-template-columns: 50px 3fr 2fr 120px;
      align-items: center;
      padding: 0.8rem;
    }
  }

  .song-row {
    display: grid;
    grid-template-columns: 50px 3fr 2fr 120px;
    align-items: center;
    padding: 0.8rem;
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

    .artist {
      a {
        color: inherit;
        text-decoration: none;
        
        &:hover {
          text-decoration: underline;
        }
      }
    }

    .actions {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 1rem;
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

    .duration {
      color: #666;
    }
  }
}

.song-info{
  img {
          width: 40px;
          height: 40px;
          border-radius: 4px;
        }
}

@media (max-width: 768px) {
  .songs-list {
    .header-row, .song-row {
      grid-template-columns: 50px 3fr 2fr 90px !important;
    }
  }
}
</style>