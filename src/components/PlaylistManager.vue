<!-- PlaylistManager.vue -->
<template>
  <div class="playlist-manager">
    <div class="songs-list">
      <div v-if="playlist.length === 0" class="empty-playlist">
        <p>No tienes canciones favoritas aún</p>
        <router-link to="/search" class="add-songs-btn">
          Añadir canciones
        </router-link>
      </div>
      
      <template v-else>
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
          <div 
            v-for="(song, index) in playlist" 
            :key="song.id"
            class="song-row"
            :class="{ 
              'playing': playerStore.currentSong?.id === song.id && playerStore.isPlaying,
              'not-readable': !song.readable 
            }"
            @dblclick="song.readable && togglePlay(song)"
          >
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
            <div class="title">
              <div class="song-info">
                <img :src="song.album.cover_small" :alt="song.title">
                <span :class="{ 'text-muted': !song.readable }">{{ song.title }}</span>
                <span v-if="song.explicit_lyrics" class="explicit-badge">E</span>
              </div>
            </div>
            <div class="artist">
              <router-link :to="'/artist/' + song.artist.id">
                {{ song.artist.name }}
              </router-link>
            </div>
            <div class="actions">
              <div class="song-actions">
                <button 
                  v-if="song.readable" 
                  class="action-btn play"
                  @click.stop="togglePlay(song)"
                >
                  <i :class="[
                    'bi',
                    {
                      'bi-pause-fill': playerStore.currentSong?.id === song.id && playerStore.isPlaying,
                      'bi-play-fill': playerStore.currentSong?.id !== song.id || !playerStore.isPlaying
                    }
                  ]"></i>
                </button>
                <button 
                  class="action-btn favorite"
                  @click="handleFavorite(song)"
                  :class="{ 'is-favorite': true }"
                >
                <i class="bi bi-heartbreak"></i>
                </button>
                <button class="action-btn" @click="addToQueue(song)">
                  <i class="bi bi-plus"></i>
                </button>
              </div>
              <span class="duration">{{ formatDuration(song.duration) }}</span>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useFavoritesStore } from '@/stores/favorites';
import { usePlayerStore } from '@/stores/player';
import SearchBar from './SearchBar.vue';

const favoritesStore = useFavoritesStore();
const playerStore = usePlayerStore();

const playlist = computed(() => favoritesStore.playlist);

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
  const currentIndex = playlist.value.findIndex(track => track.id === song.id)
  const nextSongs = playlist.value.slice(currentIndex + 1).filter(track => track.readable)

  // Iniciamos la reproducción
  playerStore.playSong(song)
  playerStore.setQueue(nextSongs)
}

const addToQueue = (song) => {
  if (!song.readable) return
  playerStore.addToQueue(song)
}

const handleFavorite = (song) => {
  favoritesStore.removeSong(song.id)
}
</script>

<style lang="scss" scoped>
.playlist-manager {
  padding: 2rem;
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

  .empty-playlist {
    text-align: center;
    padding: 2rem;
    color: #666;

    .add-songs-btn {
      display: inline-block;
      margin-top: 1rem;
      padding: 0.75rem 1.5rem;
      background-color: #A238FF;
      color: white;
      text-decoration: none;
      border-radius: 8px;
      transition: background-color 0.3s ease;

      &:hover {
        background-color: darken(#A238FF, 10%);
      }
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

        img {
          width: 40px;
          height: 40px;
          border-radius: 4px;
        }
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

@media (max-width: 768px) {
  .songs-list {
    .header-row, .song-row {
      grid-template-columns: 50px 3fr 2fr 90px !important;
    }
  }
}
</style>