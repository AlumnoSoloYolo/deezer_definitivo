<template>
  <div v-if="album" class="card">
    <div class="card-body">
      <div class="d-flex gap-4">
        <!-- Portada del álbum con overlay de reproducción -->
        <div class="album-cover-container position-relative">
          <img :src="album.cover_big" class="album-cover" :alt="album.title">
          <div 
            class="play-overlay"
            @click="playAlbum"
          >
            <i :class="isAlbumPlaying ? 'bi bi-pause-circle-fill' : 'bi bi-play-circle-fill'"></i>
          </div>
        </div>

        <!-- Información del álbum -->
        <div class="album-details">
          <h1 class="album-title">{{ album.title }}</h1>

          <div class="artist-info d-flex align-items-center my-3">
  <router-link 
    :to="`/artist/${album.artist?.id}`" 
    class="d-flex align-items-center text-decoration-none artist-link"
  >
    <img 
      :src="album.artist?.picture_small" 
      class="artist-image" 
      :alt="album.artist?.name"
    >
    <span class="artist-name ms-2">{{ album.artist?.name }}</span>
  </router-link>
</div>

          <div class="album-stats mt-4">
            <div class="stats-grid">
              <div class="stat-item">
                <i class="bi bi-music-note me-2"></i>
                {{ album.tracks?.data.length }} canciones
              </div>
              <div class="stat-item">
                <i class="bi bi-clock me-2"></i>
                {{ formatDuration(getTotalDuration()) }}
              </div>
              <div class="stat-item">
                <i class="bi bi-calendar3 me-2"></i>
                {{ formatDate(album.release_date) }}
              </div>
              <div class="stat-item">
                <i class="bi bi-people me-2"></i>
                {{ formatFans(album.fans) }} fans
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Lista de canciones -->
      <div v-if="album.tracks?.data.length" class="tracks-section mt-4">
        <div class="list-group">
          <div 
            v-for="(track, index) in album.tracks.data" 
            :key="track.id" 
            class="list-group-item d-flex align-items-center py-3"
            :class="{'active-track': isTrackPlaying(track.id)}"
          >
            <!-- Número y miniatura -->
            <div class="track-number me-3">{{ index + 1 }}</div>
            <div class="track-thumbnail-container position-relative me-3">
              <img 
                :src="album.cover_small" 
                class="track-thumbnail" 
                :alt="track.title"
              >
              <div 
                class="track-play-overlay"
                :class="{'show-overlay': isTrackPlaying(track.id)}"
                @click="togglePlay(track)"
              >
                <i :class="isTrackPlaying(track.id) ? 'bi bi-pause-fill' : 'bi bi-play-fill'"></i>
              </div>
            </div>
            
            <!-- Título y controles -->
            <div class="d-flex justify-content-between align-items-center flex-grow-1">
              <span :class="{'track-playing': isTrackPlaying(track.id)}">{{ track.title }}</span>
              <div class="track-controls d-flex align-items-center">
                <button 
                  @click="toggleFavorite(track)" 
                  class="btn btn-icon me-2"
                  :class="{'favorite-active': isFavorite(track.id)}"
                >
                  <i class="bi bi-heart-fill"></i>
                </button>
                <div class="dropdown">
                  <button 
                    class="btn btn-icon"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i class="bi bi-three-dots"></i>
                  </button>
                  <ul class="dropdown-menu dropdown-menu-end">
                    <li>
                      <router-link 
                        :to="`/album/${props.id}/track/${track.id}`" 
                        class="dropdown-item"
                      >
                        <i class="bi bi-info-circle me-2"></i>
                        Ver detalles
                      </router-link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Router view para el modal -->
    <router-view v-slot="{ Component }">
      <transition name="modal">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useFavoritesStore } from '@/stores/favorites';
import { usePlayerStore } from '@/stores/player';

const props = defineProps(['id']);
const album = ref(null);
const favoritesStore = useFavoritesStore();
const playerStore = usePlayerStore();

const isAlbumPlaying = computed(() => {
  const currentSong = playerStore.currentSong;
  return playerStore.isPlaying && currentSong && album.value?.tracks?.data.some(track => track.id === currentSong.id);
});

const isTrackPlaying = (trackId) => {
  const currentSong = playerStore.currentSong;
  return playerStore.isPlaying && currentSong && currentSong.id === trackId;
};

const isFavorite = (id) => favoritesStore.isFavorite(id);

const toggleFavorite = (song) => {
  if (isFavorite(song.id)) {
    favoritesStore.removeSong(song.id);
  } else {
    favoritesStore.addSong(song);
  }
};

const playAlbum = () => {
  if (isAlbumPlaying.value) {
    playerStore.isPlaying = false;
  } else {
    if (album.value?.tracks?.data) {
      playerStore.setQueue(album.value.tracks.data);
      playerStore.playSong(album.value.tracks.data[0]);
    }
  }
};

const togglePlay = (track) => {
  if (isTrackPlaying(track.id)) {
    playerStore.isPlaying = false;
  } else {
    if (playerStore.currentSong?.id !== track.id) {
      const trackIndex = album.value.tracks.data.findIndex(t => t.id === track.id);
      const queue = album.value.tracks.data.slice(trackIndex);
      playerStore.setQueue(queue);
      playerStore.playSong(track);
    } else {
      playerStore.isPlaying = true;
    }
  }
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const getTotalDuration = () => {
  if (!album.value?.tracks?.data) return 0;
  return album.value.tracks.data.reduce((total, track) => total + track.duration, 0);
};

const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours} h. ${minutes} minutos`;
  }
  return `${minutes} minutos`;
};

const formatFans = (fans) => {
  return new Intl.NumberFormat('es-ES').format(fans);
};

onMounted(async () => {
  try {
    const response = await fetch(`https://cors-anywhere.herokuapp.com/https://api.deezer.com/album/${props.id}`);
    album.value = await response.json();
  } catch (error) {
    console.error('Error:', error);
  }
});
</script>

<style scoped>
.album-cover {
  width: 238px;
  height: 238px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.album-cover-container {
  cursor: pointer;
}

.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.play-overlay i {
  font-size: 4rem;
  color: white;
}

.album-cover-container:hover .play-overlay {
  opacity: 1;
}

.album-title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.artist-image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.artist-name {
  font-size: 1.1rem;
  font-weight: 500;
}

.stats-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem 2rem;
}

.stat-item {
  color: #666;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
}

.stat-item i {
  font-size: 1.1rem;
}

.tracks-section {
  border-top: 1px solid #dee2e6;
  padding-top: 1rem;
  margin-top: 2rem;
}

.track-number {
  width: 30px;
  color: #666;
  font-size: 0.9rem;
  text-align: right;
}

.track-playing {
  color: #A238FF;
}

.track-thumbnail-container {
  cursor: pointer;
  position: relative;
}

.track-thumbnail {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
  transition: filter 0.2s ease;
}

.track-play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.track-play-overlay.show-overlay {
  opacity: 1;
}

.track-play-overlay i {
  font-size: 1.5rem;
  color: white;
}

.track-thumbnail-container:hover .track-play-overlay {
  opacity: 1;
}

.track-thumbnail-container:hover .track-thumbnail {
  filter: brightness(0.8);
}

.active-track {
  background-color:  rgb(245, 242, 248, 01) !important;
}

.active-track .track-thumbnail {
  box-shadow: 0 0 0 2px #A238FF;
}

.active-track .track-number {
  color: #A238FF;
  font-weight: 500;
}

.list-group-item {
  border-left: none;
  border-right: none;
  background: transparent;
  padding: 1rem 0;
  transition: background-color 0.2s ease;
}

.list-group-item:first-child {
  border-top: none;
}

.list-group-item:last-child {
  border-bottom: none;
}

.btn-icon {
  padding: 6px;
  line-height: 1;
  color: #666;
  background: transparent;
  border: none;
  transition: all 0.2s ease;
}

.btn-icon:hover {
  color: #333;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 50%;
}

.btn-icon.favorite-active {
  color: #A238FF;
}

.btn-icon.favorite-active:hover {
  color: #8B5CF6;
}

.btn-icon i {
  font-size: 1.1rem;
}

/* Transición del modal */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* Estilos del dropdown */
.dropdown-menu {
  min-width: 200px;
  padding: 0.5rem 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.dropdown-item {
  padding: 0.5rem 1rem;
  color: #666;
  transition: all 0.2s ease;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
  color: #333;
}

.dropdown-item i {
  color: #A238FF;
}
</style>