<!-- SongInfo.vue -->
<template>
    <SearchBar :initialQuery="$route.query.q || ''" />
  <div class="song-info-container">
    <div v-if="loading" class="loading">
      <p>Cargando canción...</p>
    </div>

    <div v-else-if="song" class="song-details">
      <!-- Cabecera de la canción -->
      <div class="song-header">
        <div class="cover-container">
          <img :src="song.album?.cover_xl" class="song-cover" :alt="song.title">
        </div>
        <div class="info-container">
          <span class="content-type">Canción</span>
          <h1>{{ song.title }}</h1>
          <div class="metadata">
            <router-link :to="`/artist/${song.artist.id}`" class="artist-link">
              <img :src="song.artist.picture_small" :alt="song.artist.name" class="artist-image">
              <span>{{ song.artist.name }}</span>
            </router-link>
            <div class="additional-info">
              <span>{{ formatDuration(song.duration) }}</span>
              <span class="dot">•</span>
              <router-link :to="`/album/${song.album.id}`">
                {{ song.album.title }}
              </router-link>
              <span v-if="song.explicit_lyrics" class="explicit-badge">E</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Botones de acción -->
      <div class="action-buttons">
        <div class="primary-actions">
          <button 
            v-if="song.readable" 
            class="play-button"
            @click="playSong"
            :class="{ 'is-playing': isPlaying }"
          >
            <i :class="['bi', isPlaying ? 'bi-pause-fill' : 'bi-play-fill']"></i>
          </button>
          <button 
            class="favorite-button"
            @click="toggleFavorite"
            :class="{ 'is-favorite': isFavorite }"
          >
            <i :class="['bi', isFavorite ? 'bi-heart-fill' : 'bi-heart']"></i>
          </button>
        </div>
      </div>

      <!-- Detalles y letras -->
      <div class="song-details-grid">
        <!-- Info básica -->
        <div class="details-card">
          <h3>Detalles de la canción</h3>
          <div class="details-list">
            <div class="detail-item">
              <span class="label">Fecha de lanzamiento</span>
              <span class="value">{{ formatDate(song.release_date) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">BPM</span>
              <span class="value">{{ song.bpm || 'No disponible' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Duración</span>
              <span class="value">{{ formatDuration(song.duration) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Posición en el álbum</span>
              <span class="value">#{{ song.track_position || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Ranking</span>
              <span class="value">{{ formatRank(song.rank) }}</span>
            </div>
          </div>
        </div>

        <!-- Lyrics -->
        <div class="lyrics-card" v-if="lyrics">
          <h3>Letra</h3>
          <div class="lyrics-content" v-if="lyrics.lyrics">
            <pre>{{ lyrics.lyrics }}</pre>
          </div>
          <div v-else class="no-lyrics">
            Letra no disponible
          </div>
        </div>
      </div>
    </div>

    <div v-else class="error">
      <p>No se pudo cargar la información de la canción</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useFavoritesStore } from '@/stores/favorites';
import { usePlayerStore } from '@/stores/player';
import SearchBar from './SearchBar.vue'

const route = useRoute();
const song = ref(null);
const lyrics = ref(null);
const loading = ref(true);
const favoritesStore = useFavoritesStore();
const playerStore = usePlayerStore();

const isFavorite = computed(() => 
  song.value ? favoritesStore.isFavorite(song.value.id) : false
);

const isPlaying = computed(() => 
  playerStore.currentSong?.id === song.value?.id && playerStore.isPlaying
);

const toggleFavorite = () => {
  if (!song.value) return;
  
  if (isFavorite.value) {
    favoritesStore.removeSong(song.value.id);
  } else {
    favoritesStore.addSong(song.value);
  }
};

const playSong = () => {
  if (!song.value?.readable) return;

  if (isPlaying.value) {
    playerStore.togglePlay();
  } else {
    playerStore.playSong(song.value);
  }
};

const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const formatDate = (dateString) => {
  if (!dateString) return 'No disponible';
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatRank = (rank) => {
  if (!rank) return 'No disponible';
  return new Intl.NumberFormat('es-ES').format(rank);
};

onMounted(async () => {
  try {
    // Cargar información de la canción
    const songResponse = await fetch(`http://localhost:8080/https://api.deezer.com/track/${route.params.id}`);
    const songData = await songResponse.json();
    
    if (songData.error) {
      throw new Error(songData.error.message);
    }
    
    song.value = songData;

    // Cargar letras si están disponibles
    try {
      const lyricsResponse = await fetch(`http://localhost:8080/https://api.deezer.com/track/${route.params.id}/lyrics`);
      const lyricsData = await lyricsResponse.json();
      lyrics.value = lyricsData;
    } catch (lyricsError) {
      console.log('No se pudieron cargar las letras');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<style lang="scss" scoped>
.song-info-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.loading, .error {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.song-header {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
}

.cover-container {
  width: 300px;
  height: 300px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 60px rgba(0,0,0,0.5);

  .song-cover {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.info-container {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  
  .content-type {
    font-size: 0.9rem;
    text-transform: uppercase;
    color: #666;
  }

  h1 {
    font-size: 3rem;
    margin: 0.5rem 0;
    font-weight: 700;
  }
}

.metadata {
  margin-top: 1rem;

  .artist-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: inherit;
    text-decoration: none;
    margin-bottom: 0.5rem;

    &:hover {
      text-decoration: underline;
    }

    .artist-image {
      width: 24px;
      height: 24px;
      border-radius: 50%;
    }
  }

  .additional-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #666;

    a {
      color: inherit;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
        color: #A238FF;
      }
    }

    .dot {
      color: #999;
    }
  }
}

.action-buttons {
  margin-top: 2rem;

  .primary-actions {
    display: flex;
    gap: 1rem;
  }

  button {
    border: none;
    border-radius: 50%;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;

    i {
      font-size: 1.5rem;
    }
  }

  .play-button {
    background-color: #A238FF;
    color: white;

    &:hover {
      background-color: darken(#A238FF, 10%);
      transform: scale(1.05);
    }

    &.is-playing {
      background-color: #E1DDE4;
      color: #333;
    }
  }

  .favorite-button {
    background-color: transparent;
    color: #666;

    &:hover {
      background-color: #F5F2F8;
      color: #E85E38;
    }

    &.is-favorite {
      color: #E85E38;
    }
  }
}

.song-details-grid {
  margin-top: 2rem;
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.details-card, .lyrics-card, .preview-card {
  background: #F5F2F8;
  border-radius: 12px;
  padding: 1.5rem;
  height: fit-content;

  h3 {
    font-size: 1.2rem;
    color: #333;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #E1DDE4;
  }
}

.details-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  .detail-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;

    .label {
      color: #666;
      font-size: 0.9rem;
    }

    .value {
      font-weight: 500;
    }
  }
}

.lyrics-card {
  grid-column: span 2;

  .lyrics-content {
    pre {
      white-space: pre-wrap;
      font-family: inherit;
      line-height: 1.6;
      margin: 0;
      padding: 1rem;
      background: white;
      border-radius: 8px;
      max-height: 400px;
      overflow-y: auto;
    }
  }

  .no-lyrics {
    text-align: center;
    padding: 2rem;
    color: #666;
    background: white;
    border-radius: 8px;
  }
}

.preview-card {
  .audio-player {
    width: 100%;
    height: 40px;
    border-radius: 8px;
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

@media (max-width: 768px) {
  .song-header {
    flex-direction: column;
    gap: 1rem;
  }

  .cover-container {
    width: 200px;
    height: 200px;
    margin: 0 auto;
  }

  .info-container {
    text-align: center;

    h1 {
      font-size: 2rem;
    }
  }

  .metadata {
    .artist-link {
      justify-content: center;
    }

    .additional-info {
      justify-content: center;
      flex-wrap: wrap;
    }
  }

  .action-buttons {
    .primary-actions {
      justify-content: center;
    }
  }

  .song-details-grid {
    grid-template-columns: 1fr;
  }

  .lyrics-card {
    grid-column: auto;
  }
}
</style>