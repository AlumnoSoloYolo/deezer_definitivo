<template>
  <SearchBar :initialQuery="$route.query.q || ''" />
  <div class="artist-info">
    <div v-if="loading" class="loading">
      <p>Cargando artista...</p>
    </div>
    
    <template v-else-if="artist">
      <!-- Cabecera del artista -->
      <div class="artist-header">
        <img :src="artist.picture_xl" :alt="artist.name" class="artist-banner">
        <div class="artist-info-overlay">
          <h1>{{ artist.name }}</h1>
          <div class="artist-stats">
            <span>{{ artist.nb_album }} álbumes</span>
            <span>{{ formatFans(artist.nb_fan) }} fans</span>
          </div>
        </div>
      </div>

      <section class="top-tracks">
    <h2>Canciones Populares</h2>
    <div class="tracks-list">
      <div class="songs-header">
        <div class="header-row">
          <div class="header-cell">#</div>
          <div class="header-cell">Título</div>
          <div class="header-cell text-right">
            <i class="bi bi-clock"></i>
          </div>
        </div>
      </div>

      <div class="songs-body">
        <div v-for="(track, index) in topTracks" 
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
  </section>
 

      <!-- Álbumes -->
      <section class="albums-section">
        <h2>Álbumes</h2>
        <div class="albums-grid">
          <router-link 
            v-for="album in albums" 
            :key="album.id"
            :to="'/album/' + album.id"
            class="album-card">
            <img :src="album.cover_medium" :alt="album.title">
            <div class="album-info">
              <h3>{{ album.title }}</h3>
              <p>{{ new Date(album.release_date).getFullYear() }}</p>
            </div>
          </router-link>
        </div>
      </section>
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

const artist = ref(null)
const topTracks = ref([])
const albums = ref([])
const loading = ref(true)
const error = ref(null)

const formatDuration = (seconds) => {
  if (!seconds) return '0:00'
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const formatFans = (number) => {
  if (!number) return '0'
  return new Intl.NumberFormat('es-ES', { notation: 'compact' }).format(number)
}

const togglePlay = (song) => {
  if (!song.readable) return

  // Si es la misma canción que está sonando, solo toggleamos play/pause
  if (playerStore.currentSong?.id === song.id) {
    playerStore.togglePlay()
    return
  }

  // Si es una nueva canción, la reproducimos
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
    loading.value = true
    const [artistResponse, tracksResponse, albumsResponse] = await Promise.all([
      fetch(`http://localhost:8080/https://api.deezer.com/artist/${route.params.id}`),
      fetch(`http://localhost:8080/https://api.deezer.com/artist/${route.params.id}/top`),
      fetch(`http://localhost:8080/https://api.deezer.com/artist/${route.params.id}/albums`)
    ])

    const [artistData, tracksData, albumsData] = await Promise.all([
      artistResponse.json(),
      tracksResponse.json(),
      albumsResponse.json()
    ])

    if (artistData.error || tracksData.error || albumsData.error) {
      throw new Error('Error al cargar datos del artista')
    }

    artist.value = artistData
    topTracks.value = tracksData.data
    albums.value = albumsData.data
  } catch (err) {
    console.error('Error al cargar el artista:', err)
    error.value = 'No se pudo cargar la información del artista'
  } finally {
    loading.value = false
  }
})
</script>


<style lang="scss" scoped>
.artist-info {
  color: #333;
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

.artist-header {
  position: relative;
  height: 350px;
  margin-bottom: 2rem;

  .artist-banner {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .artist-info-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 2rem;
    background: linear-gradient(transparent, rgba(0,0,0,0.8));
    color: white;

    h1 {
      font-size: 4rem;
      margin: 0;
      font-weight: 700;
      text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }

    .artist-stats {
      margin-top: 1rem;
      
      span {
        margin-right: 1.5rem;
        font-size: 1.1rem;
        text-shadow: 0 1px 2px rgba(0,0,0,0.3);
      }
    }
  }
}

section {
  padding: 2rem;

  h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
  }
}

.top-tracks {
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

.albums-section {
  .albums-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1.5rem;
  }

  .album-card {
    text-decoration: none;
    color: inherit;
    transition: transform 0.2s;

    &:hover {
      transform: translateY(-5px);
    }

    img {
      width: 100%;
      aspect-ratio: 1;
      object-fit: cover;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .album-info {
      padding: 0.8rem 0;

      h3 {
        font-size: 1rem;
        margin: 0;
        font-weight: 600;
      }

      p {
        margin: 0.3rem 0 0;
        font-size: 0.9rem;
        color: #666;
      }
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
  .artist-header {
    height: 250px;

    .artist-info-overlay h1 {
      font-size: 2.5rem;
    }
  }

  section {
    padding: 1rem;
  }

  .top-tracks {
    .header-row, .song-row {
      grid-template-columns: 50px 3fr 2fr 90px !important;
    }
  }

  .albums-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)) !important;
    gap: 1rem !important;
  }
}
</style>