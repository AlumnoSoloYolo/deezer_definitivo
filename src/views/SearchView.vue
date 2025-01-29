<template>
  <div class="search-page">
    <SearchBar :initialQuery="$route.query.q || ''" />
    
    <div class="results-container">
      <div v-if="loading" class="loading">
        <p>Buscando...</p>
      </div>
      
      <div v-else-if="results.length > 0" class="results-grid">
        
        <div v-for="item in results" 
             :key="item.id" 
             class="result-card">
          <img :src="item.album?.cover_medium" :alt="item.title">
          <div class="item-info">
            <h3>{{ item.title }}</h3>
            <p class="artist">
              <router-link :to="`/artist/${item.artist.id}`">
                {{ item.artist?.name }}
              </router-link>
            </p>
            <p class="album">
              <router-link :to="`/album/${item.album.id}`">
                {{ item.album?.title }}
              </router-link>
            </p>
            <div class="details">
              <span class="duration">{{ formatDuration(item.duration) }}</span>
              <div class="actions">
                <button 
                  class="favorite-button" 
                  @click.stop="handleFavorite(item)"
                  :class="{ 'is-favorite': favoritesStore.isFavorite(item.id) }"
                >
                  <i class="bi" :class="favoritesStore.isFavorite(item.id) ? 'bi-heart-fill' : 'bi-heart'"></i>
                </button>
                <button class="play-button" @click.stop="playSong(item)">
                  <i class="bi bi-play-fill"></i>
                </button>
                <button class="add-queue-button" @click.stop="addToQueue(item)">
                  <i class="bi bi-plus"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="hasSearched" class="no-results">
        <p>No se encontraron resultados</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { usePlayerStore } from '../stores/player';
import { useFavoritesStore } from '../stores/favorites';
import SearchBar from '../components/SearchBar.vue';

const route = useRoute();
const playerStore = usePlayerStore();
const favoritesStore = useFavoritesStore();
const loading = ref(false);
const results = ref([]);
const hasSearched = ref(false);

const fetchResults = async (query, filters) => {
  loading.value = true;
  hasSearched.value = true;

  try {
    let baseQuery = '';
    
    if (query?.trim()) {
      baseQuery = query.trim();
    }
    
    if (filters.genre) {
      baseQuery = baseQuery ? `${baseQuery} genre:"${filters.genre}"` : `genre:"${filters.genre}"`;
    }
    
    if (!baseQuery) {
      baseQuery = 'a';
    }

    const url = `http://localhost:8080/https://api.deezer.com/search?q=${encodeURIComponent(baseQuery)}`;
    const response = await fetch(url);
    const data = await response.json();
    
    let filtered = data.data || [];

    if (filters.year) {
      filtered = filtered.filter(item => {
        if (!item.album?.release_date) return false;
        const year = new Date(item.album.release_date).getFullYear();
        
        switch (filters.year) {
          case 'older':
            return year < 1960;
          case '2020':
            return year >= 2020;
          case '2010':
            return year >= 2010 && year < 2020;
          case '2000':
            return year >= 2000 && year < 2010;
          case '1990':
            return year >= 1990 && year < 2000;
          case '1980':
            return year >= 1980 && year < 1990;
          case '1970':
            return year >= 1970 && year < 1980;
          case '1960':
            return year >= 1960 && year < 1970;
          default:
            return true;
        }
      });
    }

    if (filters.duration) {
      const maxDurationSeconds = filters.duration * 60;
      filtered = filtered.filter(item => item.duration <= maxDurationSeconds);
    }

    results.value = filtered;
  } catch (error) {
    console.error('Error:', error);
    results.value = [];
  } finally {
    loading.value = false;
  }
};

const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const playSong = (song) => {
  playerStore.playSong(song);
};

const addToQueue = (song) => {
  playerStore.addToQueue(song);
};

const handleFavorite = (song) => {
  if (favoritesStore.isFavorite(song.id)) {
    favoritesStore.removeSong(song.id);
  } else {
    favoritesStore.addSong(song);
  }
};

watch(
  () => route.query,
  (newQuery) => {
    fetchResults(newQuery.q, {
      genre: newQuery.genre,
      year: newQuery.year,
      duration: newQuery.duration
    });
  },
  { immediate: true, deep: true }
);
</script>

<style scoped>

.results-container {
  max-width: 1200px;
  margin: 20px auto;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  padding: 20px;
}

.result-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.2s;
  cursor: pointer;
  position: relative;
}

.result-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.result-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.item-info {
  padding: 15px;
  transition: background-color 0.2s;
}

.result-card:hover .item-info {
  background-color: #f8f9fa;
}

.item-info h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 5px;
}

.artist a, .album a {
  text-decoration: none;
  color: inherit;
  transition: color 0.2s;
}

.artist a:hover {
  color: #007bff;
}

.album a:hover {
  color: #0056b3;
}

.artist {
  color: #666;
  margin: 5px 0;
}

.album {
  color: #888;
  font-size: 0.9rem;
  margin: 5px 0;
}

.details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.actions {
  display: flex;
  gap: 8px;
}

.play-button, .add-queue-button {
  background: #007bff;
  color: white;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s, background-color 0.2s;
}

.add-queue-button {
  background: #6c757d;
}

.play-button:hover, .add-queue-button:hover {
  transform: scale(1.1);
}

.play-button:hover {
  background: #0056b3;
}

.add-queue-button:hover {
  background: #5a6268;
}

.duration {
  font-size: 0.8rem;
  color: #999;
}

.loading, .no-results {
  text-align: center;
  padding: 40px;
  color: #666;
}

@media (max-width: 768px) {
  .results-grid {
    grid-template-columns: 1fr;
  }

  .actions {
    position: absolute;
    right: 10px;
    bottom: 10px;
  }
  
  .duration {
    font-size: 0.7rem;
  }
}


.favorite-button {
  background: transparent;
  color: #dc3545;
  border: 2px solid #dc3545;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.favorite-button:hover {
  transform: scale(1.1);
  background: #dc3545;
  color: white;
}

.favorite-button.is-favorite {
  background: #dc3545;
  color: white;
}

.favorite-button.is-favorite:hover {
  background: #c82333;
  border-color: #c82333;
}

@keyframes heartBeat {
  0% { transform: scale(1); }
  14% { transform: scale(1.3); }
  28% { transform: scale(1); }
  42% { transform: scale(1.3); }
  70% { transform: scale(1); }
}

.favorite-button.is-favorite i {
  animation: heartBeat 1s;
}

/* Actualiza los estilos de actions para incluir el nuevo botón */
.actions {
  display: flex;
  gap: 8px;
  align-items: center;
}
</style>