<template>
  <div class="album-page-container">
    <!-- Barra de búsqueda -->
    <SearchBar :initial-query="$route.query.q || ''" />
    
    <!-- Contenedor de información del álbum -->
    <div class="album-info">
      <!-- Estado de carga -->
      <div v-if="loading" class="loading">
        <p>Cargando álbum...</p>
      </div>
      
      <!-- Contenido del álbum -->
      <template v-else-if="album">
        <!-- Encabezado del álbum -->
        <section class="album-header">
          <!-- Portada del álbum -->
          <div class="cover-container">
            <img 
              :src="album.cover_big || album.cover_xl" 
              :alt="album.title"
            >
          </div>
          
          <!-- Información del álbum -->
          <div class="info-container">
            <span class="album-type">Álbum</span>
            
            <h1>{{ album.title }}</h1>
            
            <div class="album-meta">
              <!-- Enlace al artista -->
              <router-link 
                :to="'/artist/' + album.artist.id" 
                class="artist-link"
              >
                <img 
                  :src="album.artist.picture_small" 
                  :alt="album.artist.name"
                >
                <span>{{ album.artist.name }}</span>
              </router-link>
              
              <!-- Estadísticas del álbum -->
              <div class="stats">
                <span>{{ new Date(album.release_date).getFullYear() }}</span>
                <span class="dot">•</span>
                <span>{{ album.nb_tracks }} canciones</span>
                <span class="dot">•</span>
                <span>{{ formatDuration(album.duration) }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Lista de canciones -->
        <section class="songs-list">
          <!-- Encabezado de la lista -->
          <div class="songs-header">
            <div class="header-row">
              <div class="header-cell">#</div>
              <div class="header-cell title-cell">Título</div>
              <div class="header-cell text-right">
                <i class="bi bi-clock"></i>
              </div>
            </div>
          </div>

          <!-- Cuerpo de la lista de canciones -->
          <div class="songs-body">
            <div 
              v-for="(song, index) in album.tracks.data" 
              :key="song.id"
              class="song-row"
              :class="{ 
                'playing': isCurrentlyPlaying(song),
                'not-readable': !song.readable 
              }"
              @dblclick="handleSongDoubleClick(song)"
            >
              <!-- Número de canción y botón de reproducción -->
              <div class="number">
                <span class="index">{{ index + 1 }}</span>
                <button 
                  v-if="song.readable" 
                  class="play-btn"
                  @click.stop="togglePlay(song)"
                  :class="{ 'is-playing': isCurrentlyPlaying(song) }"
                >
                  <i :class="getPlayPauseIcon(song)"></i>
                </button>
              </div>

              <!-- Título de la canción -->
              <div class="title">
                <div class="image-container">
                  <img 
                    :src="song.album.cover_small" 
                    :alt="song.title" 
                    class="song-album-image"
                  >
                  <button 
                    v-if="song.readable" 
                    class="overlay-play-btn"
                    @click.stop="togglePlay(song)"
                  >
                    <i :class="getPlayPauseIcon(song)"></i>
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
                    <span 
                      v-if="song.explicit_lyrics" 
                      class="explicit-badge"
                    >
                      E
                    </span>
                  </div>
                </div>
              </div>

            

              <!-- Acciones y duración -->
              <div class="actions">
                <div class="song-actions">
                  <button 
                    class="action-btn favorite"
                    @click="handleFavorite(song)"
                    :class="{ 'is-favorite': favoritesStore.isFavorite(song.id) }"
                  >
                    <i 
                      :class="favoritesStore.isFavorite(song.id) 
                        ? 'bi bi-heart-fill' 
                        : 'bi bi-heart'"
                    ></i>
                  </button>
                  <button 
                    class="action-btn" 
                    @click="addToQueue(song)"
                  >
                    <i class="bi bi-plus"></i>
                  </button>
                </div>
                <span class="duration">
                  {{ formatDuration(song.duration) }}
                </span>
              </div>
            </div>
          </div>
        </section>
      </template>

      <!-- Estado de error -->
      <div v-else-if="error" class="error-message">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { usePlayerStore } from '../stores/player'
import { useFavoritesStore } from '../stores/favorites'
import SearchBar from './SearchBar.vue'

// Aquí inicializo stores y rutas
const route = useRoute()
const playerStore = usePlayerStore()
const favoritesStore = useFavoritesStore()

// Estado reactivo del álbum
const album = ref(null)
const loading = ref(true)
const error = ref(null)

// Formateo de duración: 
// Método para convertir segundos a formato mm:ss
const formatDuration = (seconds) => {
  if (!seconds) return '0:00'
  
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// Funciones auxiliares para reproducción
// Compruebo si la canción actual está reproduciéndose
const isCurrentlyPlaying = (song) => 
  playerStore.currentSong?.id === song.id && playerStore.isPlaying

// Obtengo el icono correcto de play/pause
const getPlayPauseIcon = (song) => [
  'bi',
  isCurrentlyPlaying(song) ? 'bi-pause-fill' : 'bi-play-fill'
]

// Gestiono la reproducción al hacer doble clic
const handleSongDoubleClick = (song) => {
  if (song.readable) {
    togglePlay(song)
  }
}

// Esta es la lógica principal de reproducción que he seguido:

// Controlo la reproducción de canciones, preparando la cola y manejando el estado
const togglePlay = (song) => {
  // Bloqueo de canciones no reproducibles
  if (!song.readable) return

  // Gestiono si es la misma canción o una nueva
  if (playerStore.currentSong?.id === song.id) {
    playerStore.togglePlay()
    return
  }

  // Preparo la cola de reproducción
  const allTracks = album.value.tracks.data
  const currentIndex = allTracks.findIndex(track => track.id === song.id)
  const nextSongs = allTracks
    .slice(currentIndex + 1)
    .filter(track => track.readable)

  // Inicio la reproducción
  playerStore.playSong(song)
  playerStore.setQueue(nextSongs)
}

// Añado canciones a la cola de reproducción
const addToQueue = (song) => {
  if (!song.readable) return
  playerStore.addToQueue(song)
}

// Gestiono la adición/eliminación de favoritos
const handleFavorite = (song) => {
  if (favoritesStore.isFavorite(song.id)) {
    favoritesStore.removeSong(song.id)
  } else {
    favoritesStore.addSong(song)
  }
}

// Cargo los datos del álbum al montar el componente
onMounted(async () => {
  try {
    // Realizo la petición para obtener los datos del álbum
    const response = await fetch(
      `http://localhost:8080/https://api.deezer.com/album/${route.params.id}`
    )
    const data = await response.json()

    // Manejo de posibles errores
    if (data.error) {
      throw new Error(data.error.message || 'Error al cargar el álbum')
    }

    // Asigno los datos del álbum
    album.value = data
  } catch (err) {
    // Gestiono cualquier error en la carga
    console.error('Error al cargar el álbum:', err)
    error.value = 'No se pudo cargar el álbum'
  } finally {
    // Finalizo el estado de carga
    loading.value = false
  }
})
</script>

<style lang="scss" scoped>
// Variables para breakpoints
$breakpoint-lg: 1200px;
$breakpoint-md: 992px;
$breakpoint-sm: 768px;
$breakpoint-xs: 576px;

.album-info {
  padding: 2rem;
  width: 100%;
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
  width: 100%;

  // Responsive design para móviles
  @media (max-width: $breakpoint-sm) {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .cover-container {
    width: 232px;
    height: 232px;
    flex-shrink: 0;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 60px rgba(0,0,0,0.3);
    
    @media (max-width: $breakpoint-sm) {
      width: 200px;
      height: 200px;
    }

    @media (max-width: $breakpoint-xs) {
      width: 160px;
      height: 160px;

      
    }
    
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
    flex-grow: 1;
    min-width: 0;

    @media (max-width: $breakpoint-sm) {
      align-items: center;
      width: 100%;
    }

    .album-type {
      font-size: 0.9rem;
      text-transform: uppercase;
      color: #666;
    }

    h1 {
      font-size: 3rem;
      margin: 0.5rem 0;
      font-weight: 700;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      @media (max-width: $breakpoint-sm) {
        font-size: 2rem;
        text-align: center;
      }
    }

    .album-meta {
      margin-top: 1rem;
      width: 100%;

      @media (max-width: $breakpoint-sm) {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .artist-link {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        text-decoration: none;
        color: inherit;
        font-weight: 600;
        margin-bottom: 0.5rem;
        max-width: 100%;
        
        @media (max-width: $breakpoint-sm) {
          justify-content: center;
        }

        &:hover {
          text-decoration: underline;
        }

        img {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        span {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }

      .stats {
        color: #666;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;

        @media (max-width: $breakpoint-sm) {
          justify-content: center;
        }

        .dot {
          margin: 0 0.2rem;
        }
      }
    }
  }
}

.songs-list {
  margin-top: 2rem;
  width: 100%;
  overflow-x: auto; 

  .songs-header {
    color: #666;
    font-size: 0.9rem;
    text-transform: uppercase;
    border-bottom: 1px solid #E1DDE4;
    
    .header-row {
      display: grid;
      grid-template-columns: 50px minmax(300px, 3fr) minmax(150px, 2fr) minmax(150px, 2fr) 120px;
      align-items: center;
      padding: 0.8rem;

      @media (max-width: $breakpoint-md) {
        grid-template-columns: 50px minmax(200px, 3fr) minmax(120px, 2fr) 120px;
      }

      @media (max-width: $breakpoint-sm) {
        display: none;
      }
    }
  }

  .song-row {
    display: grid;
    grid-template-columns: 50px minmax(300px, 3fr) minmax(150px, 2fr) minmax(150px, 2fr) 120px;
    align-items: center;
    padding: 0.8rem;
    border-radius: 8px;
    transition: all 0.2s;

    @media (max-width: $breakpoint-md) {
      grid-template-columns: 50px minmax(200px, 3fr) minmax(120px, 2fr) 120px;
    }

    @media (max-width: $breakpoint-sm) {
      grid-template-columns: 50px 1fr auto;
      gap: 0.5rem;
      
      // Ocultar columnas en móvil
      .artist,
      .album-cell {
        display: none;
      }

      // Ajustar título
      .title {
        display: flex;
        align-items: center;
        min-width: 0;

        .song-info {
          display: flex;
          flex-direction: column;
          min-width: 0;
          
          .song-title-wrapper {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 100%;
          }
        }
      }

      // Ajustar acciones
      .actions {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        
        .song-actions {
          opacity: 1;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .duration {
          margin-left: 0.5rem;
        }
      }
    }

    @media (max-width: $breakpoint-xs) {
      grid-template-columns: 50px 1fr;
      
      .actions {
        flex-direction: column;
        align-items: flex-end;
        gap: 0.25rem;
      }

       .duration {
        display: none;
      }
    }

    // Cuando se hace hover en toda la fila
    &:hover {
      background-color: #F5F2F8;
      cursor: pointer;
      user-select: none;

      .song-actions {
        opacity: 1;
      }

      .number {
        .index {
          display: none;
        }

        .play-btn {
          display: flex;
        }
      }

      .overlay-play-btn {
        opacity: 1;
      }
    }

    .number {
      position: relative;
      width: 40px;

      .index {
        display: block;
      }

      .play-btn {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: none;
        border: none;
        cursor: pointer;
        color: #A238FF;
        font-size: 1.2rem;
        display: none;
        z-index: 10;
      }
    }


  .title {
    display: flex;
    align-items: center;
    gap: 1rem;

    .image-container {
      position: relative;
      width: 40px;
      height: 40px;

      .song-album-image {
        width: 100%;
        height: 100%;
        border-radius: 4px;
        object-fit: cover;
      }

      .overlay-play-btn {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: rgba(0, 0, 0, 0.5);
        border: none;
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.2s;
        border-radius: 4px;

        i {
          color: white;
          font-size: 1.4rem;
        }

        &:hover {
          background-color: rgba(0, 0, 0, 0.7);
        }
      }
    }

    .song-info {
      .song-title-wrapper {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .song-title-link {
        color: inherit;
        text-decoration: none;
        font-weight: 500;
        
        &:hover {
          text-decoration: underline;
          color: #A238FF;
        }
      }

      .explicit-badge {
        min-width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #666;
        color: white;
        border-radius: 3px;
        font-size: 0.7rem;
      }
    }
  }

  .artist, .album {
    a {
      color: inherit;
      text-decoration: none;
      
      &:hover {
        text-decoration: underline;
        color: #A238FF;
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


.header-cell.text-right {
  text-align: right; 
}

// Media queries para responsividad
@media (max-width: 1200px) {
  .song-row, .header-row {
    grid-template-columns: 50px minmax(250px, 3fr) minmax(150px, 2fr) minmax(150px, 2fr) 120px;
  }
}

@media (max-width: 992px) {
  .song-row, .header-row {
    grid-template-columns: 50px minmax(200px, 3fr) minmax(120px, 2fr) 120px;
  }
  
  .album-cell {
    display: none;
  }
}

@media (max-width: 768px) {
  .song-row, .header-row {
    grid-template-columns: 50px 1fr 120px;
  }

  .artist {
    display: none;
  }

  .song-info {
    .song-details {
      display: none;
    }
  }
}
}
</style>