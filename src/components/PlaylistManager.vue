# PlaylistManager.vue
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
            <div class="header-cell title-cell">Título</div>
            <div class="header-cell artist-cell">Artista</div>
            <div class="header-cell album-cell">Álbum</div>
            <div class="header-cell duration-cell">
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
                'not-readable': !song.readable,
                'dragging': isDragging && draggedIndex === index,
                'drag-over': dragOverIndex === index
              }"
              draggable="true"
              @dragstart="handleDragStart($event, index)"
              @dragend="handleDragEnd"
              @dragenter.prevent="handleDragEnter($event, index)"
              @dragover.prevent="handleDragOver($event, index)"
              @dragleave="handleDragLeave($event, index)"
              @drop="handleDrop($event, index)"
              @dblclick="song.readable && togglePlay(song)"
            >
            <div class="number">
              <span class="index">{{ index + 1 }}</span>
              <i class="bi bi-grip-vertical drag-handle"></i>
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
              </div>
            </div>

            <div class="artist">
              <router-link :to="`/artist/${song.artist.id}`">
                {{ song.artist.name }}
              </router-link>
            </div>

            <div class="album album-cell">
              <router-link :to="`/album/${song.album.id}`">
                {{ song.album.title }}
              </router-link>
            </div>

            <div class="actions">
              <div class="song-actions">
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

// PlaylistManager.vue - Script completo
<script setup>
import { ref, computed } from 'vue';
import { useFavoritesStore } from '@/stores/favorites';
import { usePlayerStore } from '@/stores/player';

const favoritesStore = useFavoritesStore();
const playerStore = usePlayerStore();

// Estado local para drag and drop
const isDragging = ref(false);
const draggedIndex = ref(null);
const dragOverIndex = ref(null);

// Computed prop para la playlist
const playlist = computed(() => favoritesStore.playlist);

/**
 * Yo me encargo de formatear la duración de la canción
 * de segundos a formato mm:ss
 */
const formatDuration = (seconds) => {
  if (!seconds) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Yo me encargo de controlar la reproducción de las canciones.
 * Si la canción actual está sonando, la pauso.
 * Si es una nueva canción, la reproduzco y actualizo la cola.
 */
const togglePlay = (song) => {
  if (!song.readable) return;

  if (playerStore.currentSong?.id === song.id) {
    playerStore.togglePlay();
    return;
  }

  const currentIndex = playlist.value.findIndex(track => track.id === song.id);
  const nextSongs = playlist.value.slice(currentIndex + 1).filter(track => track.readable);

  playerStore.playSong(song);
  playerStore.setQueue(nextSongs);
};

/**
 * Yo me encargo de añadir una canción a la cola de reproducción
 */
const addToQueue = (song) => {
  if (!song.readable) return;
  playerStore.addToQueue(song);
};

/**
 * Yo me encargo de eliminar una canción de favoritos
 */
const handleFavorite = (song) => {
  favoritesStore.removeSong(song.id);
};

/**
 * Yo me encargo de iniciar el proceso de arrastre
 */
const handleDragStart = (event, index) => {
  isDragging.value = true;
  draggedIndex.value = index;
  event.dataTransfer.effectAllowed = 'move';
  
  // Establecer el índice como dato transferido
  event.dataTransfer.setData('text/plain', index.toString());
  
  // Añadir clase para estilo
  event.target.closest('.song-row').classList.add('dragging');
  
  // Debug log
  console.log('Drag started from index:', index);
};

/**
 * Yo me encargo de manejar el evento dragover
 */
const handleDragOver = (event, index) => {
  event.preventDefault();
  const draggedOverItem = event.target.closest('.song-row');
  
  if (!draggedOverItem || draggedIndex.value === index) return;
  
  dragOverIndex.value = index;
  event.dataTransfer.dropEffect = 'move';
};

/**
 * Yo me encargo de manejar cuando el elemento arrastrado
 * entra en una zona válida de soltar
 */
const handleDragEnter = (event, index) => {
  if (index !== draggedIndex.value) {
    dragOverIndex.value = index;
  }
};

/**
 * Yo me encargo de manejar cuando el elemento arrastrado
 * sale de una zona válida de soltar
 */
const handleDragLeave = (event, index) => {
  if (dragOverIndex.value === index) {
    dragOverIndex.value = null;
  }
};

/**
 * Yo me encargo de finalizar el proceso de arrastre
 */
const handleDragEnd = () => {
  isDragging.value = false;
  draggedIndex.value = null;
  dragOverIndex.value = null;
  
  // Limpiar todas las clases de arrastre
  document.querySelectorAll('.song-row').forEach(row => {
    row.classList.remove('dragging', 'drag-over');
  });
};

/**
 * Yo me encargo de procesar la acción de soltar el elemento
 * y actualizar el orden de la playlist
 */
const handleDrop = (event, dropIndex) => {
  event.preventDefault();
  event.stopPropagation();
  
  const startIndex = parseInt(event.dataTransfer.getData('text/plain'));
  
  // Debug logs
  console.log('Drop event - Start Index:', startIndex, 'Drop Index:', dropIndex);
  
  if (isNaN(startIndex) || startIndex === dropIndex) {
    handleDragEnd();
    return;
  }

  // Crear nueva lista con el orden actualizado
  const newPlaylist = [...playlist.value];
  const [movedItem] = newPlaylist.splice(startIndex, 1);
  newPlaylist.splice(dropIndex, 0, movedItem);

  // Debug log
  console.log('New playlist order:', newPlaylist);

  // Actualizar el store
  favoritesStore.updatePlaylistOrder(newPlaylist);
  
  // Limpiar estados
  handleDragEnd();
  
  // Actualizar cola de reproducción si es necesario
  if (playerStore.currentSong) {
    const currentIndex = newPlaylist.findIndex(song => song.id === playerStore.currentSong.id);
    if (currentIndex !== -1) {
      const nextSongs = newPlaylist.slice(currentIndex + 1).filter(song => song.readable);
      playerStore.setQueue(nextSongs);
    }
  }
};
</script>

<style lang="scss" scoped>
// Variables
$primary-color: #A238FF;
$secondary-color: #E85E38;
$background-color: #F5F2F8;
$border-color: #E1DDE4;
$text-color: #666;
$white: #fff;
$black: #000;

// Mixins
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

@mixin button-reset {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.playlist-manager {
  padding: 2rem;
}

.songs-list {
  margin-top: 2rem;

  .empty-playlist {
    text-align: center;
    padding: 2rem;
    color: $text-color;

    .add-songs-btn {
      display: inline-block;
      margin-top: 1rem;
      padding: 0.75rem 1.5rem;
      background-color: $primary-color;
      color: $white;
      text-decoration: none;
      border-radius: 8px;
      transition: background-color 0.3s ease;

      &:hover {
        background-color: darken($primary-color, 10%);
      }
    }
  }
}

.songs-header {
  color: $text-color;
  font-size: 0.9rem;
  text-transform: uppercase;
  border-bottom: 1px solid $border-color;
  
  .header-row {
    display: grid;
    grid-template-columns: 50px minmax(300px, 1fr) minmax(150px, 2fr) minmax(150px, 2fr) 80px;
    align-items: center;
    padding: 0.8rem;
  }

  .duration-cell{
    text-align: right;
  }
}

.song-row {
  display: grid;
  grid-template-columns: 50px minmax(300px, 1fr) minmax(150px, 2fr) minmax(150px, 2fr) 80px;
  align-items: center;
  padding: 0.8rem;
  border-radius: 8px;
  transition: all 0.2s;
  user-select: none;
  cursor: pointer;
  border: 2px solid transparent;
  position: relative;

  &.dragging {
    opacity: 0.5;
    background-color: $background-color;
    border: 2px dashed $primary-color;
    cursor: grabbing;
    
    * {
      pointer-events: none;
    }
  }

  &.drag-over {
    background-color: lighten($background-color, 2%);
    transform: translateY(2px);
    box-shadow: 0 -2px 0 $primary-color;
  }

  &:hover {
    background-color: $background-color;

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

    .drag-handle {
      display: inline-block;
    }
  }

  &.playing {
    background-color: $background-color;
  }

  &.not-readable {
    opacity: 0.5;
  }
}

.number {
  position: relative;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;

  .index {
    display: block;
    position: absolute;
  }

  .drag-handle {
    display: none;
    color: $text-color;
    cursor: grab;
    margin-right: 0.5rem;

    &:active {
      cursor: grabbing;
    }
  }

  .play-btn {
    @include button-reset;
    display: none;
    position: absolute;
    color: $primary-color;
    font-size: 1.2rem;
    width: 100%;
    height: 100%;
    align-items: center;
    justify-content: center;

    &:hover {
      color: darken($primary-color, 10%);
      transform: scale(1.1);
    }
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
      @include flex-center;
      background-color: rgba($black, 0.5);
      border: none;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.2s;
      border-radius: 4px;

      i {
        color: $white;
        font-size: 1.4rem;
      }

      &:hover {
        background-color: rgba($black, 0.7);
      }
    }
  }

  .song-info {
    overflow: hidden;
    
    .song-title-wrapper {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .song-title-link {
      color: inherit;
      text-decoration: none;
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
      display: block;
      
      &:hover {
        text-decoration: underline;
        color: $primary-color;
      }
    }

    .explicit-badge {
      min-width: 20px;
      height: 20px;
      @include flex-center;
      background-color: $text-color;
      color: $white;
      border-radius: 3px;
      font-size: 0.7rem;
      flex-shrink: 0;
    }

    .song-details {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: $text-color;

      a {
        color: $text-color;
        text-decoration: none;
        
        &:hover {
          text-decoration: underline;
          color: $primary-color;
        }
      }

      .separator {
        color: #999;
      }
    }
  }
}

.artist,
.album {
  a {
    color: inherit;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
      color: $primary-color;
    }
  }
}

.actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  padding-right: 0.5rem;
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
        color: $secondary-color;
      }
    }

    i {
      font-size: 1.2rem;
      color: $primary-color;
    }
  }
}

.duration {
  color: $text-color;
  margin-left: auto;
}

.songs-header .header-row,
.song-row {
  display: grid;
  grid-template-columns: 50px minmax(300px, 1fr) minmax(150px, 2fr) minmax(150px, 2fr) 80px;
  align-items: center;
  padding: 0.8rem;
}

// Tablet (768px - 1024px)
@media (max-width: 1024px) {
  .songs-header .header-row,
  .song-row {
    grid-template-columns: 50px minmax(200px, 1fr) minmax(120px, 2fr) 80px;
  }
  
  .album-cell {
    display: none;
  }
}

// Móvil (< 768px)
@media (max-width: 768px) {
  .playlist-manager {
    padding: 1rem;
  }

  .songs-header .header-row,
  .song-row {
    grid-template-columns: 40px 1fr 60px;
    padding: 0.8rem 0.5rem;
  }

  .artist,
  .album-cell, .duration-cell {
    display: none;
  }

  .title {
    .image-container {
      width: 35px;
      height: 35px;
    }
  }

  .song-actions {
    position: absolute;
    right: 70px;
    opacity: 0;
    gap: 0.25rem;

    .action-btn {
      width: 24px;
      height: 24px;
      
      i {
        font-size: 1rem;
      }
    }
  }

  .number {
    width: 25px;
    height: 25px;
    
    .play-btn {
      font-size: 1rem;
    }
  }

  .duration {
    font-size: 0.85rem;
  }
}
</style>
    