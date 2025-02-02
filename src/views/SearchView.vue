<!-- SearchPage.vue -->
<template>
  <div class="search-page">
    <SearchBar :initialQuery="$route.query.q || ''" />
    
    <!-- Sección de búsqueda si hay query -->
    <div v-if="$route.query.q || $route.query.genre" class="results-container">
      <div v-if="loading" class="loading">
        <p>Buscando...</p>
      </div>
      
      <div v-else-if="results.length > 0" class="results-list">
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
            v-for="(item, index) in results" 
            :key="item.id"
            class="song-row"
            :class="{ 
              'playing': playerStore.currentSong?.id === item.id && playerStore.isPlaying,
              'not-readable': !item.readable 
            }"
            @dblclick="item.readable && togglePlay(item)"
          >
            <div class="number">
              <span class="index">{{ index + 1 }}</span>
              <button 
                v-if="item.readable" 
                class="play-btn"
                @click.stop="togglePlay(item)"
                :class="{ 'is-playing': playerStore.currentSong?.id === item.id && playerStore.isPlaying }"
              >
                <i :class="[
                  'bi',
                  playerStore.currentSong?.id === item.id && playerStore.isPlaying 
                    ? 'bi-pause-fill' 
                    : 'bi-play-fill'
                ]"></i>
              </button>
            </div>
            <div class="title">
              <img 
                v-if="item.album && item.album.cover_small" 
                :src="item.album.cover_small" 
                :alt="item.title" 
                class="song-album-image"
              >
              <div class="song-info">
                <span :class="{ 'text-muted': !item.readable }">
                  {{ item.title }}
                </span>
                <span v-if="item.explicit_lyrics" class="explicit-badge">E</span>
              </div>
            </div>
            <div class="artist">
              <router-link 
                v-if="item.artist" 
                :to="`/artist/${item.artist.id}`"
              >
                {{ item.artist.name }}
              </router-link>
            </div>
            <div class="actions">
              <div class="song-actions">
                <button 
                  v-if="item.readable" 
                  class="action-btn play"
                  @click.stop="togglePlay(item)"
                >
                  <i :class="[
                    'bi',
                    {
                      'bi-pause-fill': playerStore.currentSong?.id === item.id && playerStore.isPlaying,
                      'bi-play-fill': playerStore.currentSong?.id !== item.id || !playerStore.isPlaying
                    }
                  ]"></i>
                </button>
                <button 
                  class="action-btn favorite"
                  @click="handleFavorite(item)"
                  :class="{ 'is-favorite': favoritesStore.isFavorite(item.id) }"
                >
                  <i :class="favoritesStore.isFavorite(item.id) ? 'bi bi-heart-fill' : 'bi bi-heart'"></i>
                </button>
                <button class="action-btn" @click="addToQueue(item)">
                  <i class="bi bi-plus"></i>
                </button>
              </div>
              <span class="duration">{{ formatDuration(item.duration) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="hasSearched" class="no-results">
        <p>No se encontraron resultados</p>
      </div>
    </div>

    <!-- Contenido de descubrimiento -->
    <div v-else class="discover-sections">


        <!-- Géneros Musicales -->
        <section class="featured-section">
        <h2 class="section-title">Explorar Género</h2>
        <div class="genres-grid">
          <div v-for="genre in genres" 
               :key="genre.id"
               class="genre-card"
               @click="searchByGenre(genre.id)">
            <img :src="genre.picture_medium" :alt="genre.name">
            <div class="genre-overlay">
              <h3>{{ genre.name }}</h3>
            </div>
          </div>
        </div>
      </section>

      <!-- Playlists Destacadas -->
      <section class="featured-section">
        <h2 class="section-title">Playlists Destacadas</h2>
        <div class="playlists-grid">
          <div v-for="playlist in playlists" 
               :key="playlist.id"
               class="playlist-card"
               @click="navigateToPlaylist(playlist.id)">
            <img :src="playlist.picture_medium" :alt="playlist.title">
            <div class="playlist-info">
              <h3>{{ playlist.title }}</h3>
              <p>{{ playlist.nb_tracks }} canciones</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Últimos Álbumes -->
      <section class="featured-section">
        <h2 class="section-title">Últimos Lanzamientos</h2>
        <div class="albums-grid">
          <div v-for="album in latestAlbums" 
               :key="album.id"
               class="album-card"
               @click="navigateToAlbum(album.id)">
            <img :src="album.cover_medium" :alt="album.title">
            <div class="album-info">
              <h3>{{ album.title }}</h3>
              <p>{{ album.artist.name }}</p>
            </div>
          </div>
        </div>
      </section>

    
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePlayerStore } from '../stores/player';
import { useFavoritesStore } from '../stores/favorites';
import SearchBar from '../components/SearchBar.vue';

// Stores y router
const route = useRoute();
const router = useRouter();
const playerStore = usePlayerStore();
const favoritesStore = useFavoritesStore();

// Estados
const loading = ref(false);
const results = ref([]);
const hasSearched = ref(false);
const playlists = ref([]);
const latestAlbums = ref([]);
const genres = ref([]);

// Funciones de utilidad
const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// En SearchView.vue, actualiza la función fetchResults

const fetchResults = async (query, filters) => {
  loading.value = true;
  hasSearched.value = true;
  results.value = [];

  try {
    let baseUrl = 'http://localhost:8080/https://api.deezer.com/search';
    let searchQuery = query?.trim() || '';

    // Construir la consulta de búsqueda
    if (filters?.genre) {
      // Si hay un género, añadirlo a la búsqueda
      searchQuery += searchQuery ? ` genre:"${filters.genre}"` : `genre:"${filters.genre}"`;
    }

    // Si no hay búsqueda ni género, usar un término por defecto
    if (!searchQuery) {
      searchQuery = 'a';
    }

    const urlParams = new URLSearchParams();
    urlParams.append('q', searchQuery);

    const url = `${baseUrl}?${urlParams.toString()}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data || !data.data) {
      throw new Error('No se encontraron datos');
    }

    let filtered = data.data;

    // Aplicar filtros adicionales
    if (filters) {
      if (filters.duration) {
        const maxDurationSeconds = parseInt(filters.duration) * 60;
        filtered = filtered.filter(item => item.duration <= maxDurationSeconds);
      }

      if (filters.yearFrom || filters.yearTo) {
        filtered = filtered.filter(item => {
          if (!item.album?.release_date) return true;
          const year = new Date(item.album.release_date).getFullYear();
          return (!filters.yearFrom || year >= filters.yearFrom) && 
                 (!filters.yearTo || year <= filters.yearTo);
        });
      }
    }

    results.value = filtered;
  } catch (error) {
    console.error('Error en la búsqueda:', error);
    results.value = [];
  } finally {
    loading.value = false;
  }
};

// También actualizar searchByGenre
const searchByGenre = async (genreId) => {
  try {
    // Primero obtenemos el nombre del género
    const genre = genres.value.find(g => g.id === genreId);
    
    if (genre) {
      router.push({
        path: '/search',
        query: { 
          genre: genreId,
          genreName: genre.name
        }
      });
    }
  } catch (error) {
    console.error('Error al buscar por género:', error);
  }
};

// Funciones de carga de datos de descubrimiento
const fetchPlaylists = async () => {
  try {
    const response = await fetch('http://localhost:8080/https://api.deezer.com/editorial/0/charts');
    const data = await response.json();
    playlists.value = data.playlists.data.slice(0, 8);
  } catch (error) {
    console.error('Error fetching playlists:', error);
  }
};

const fetchLatestAlbums = async () => {
  try {
    const response = await fetch('http://localhost:8080/https://api.deezer.com/chart/0/albums');
    const data = await response.json();
    latestAlbums.value = data.data.slice(0, 8);
  } catch (error) {
    console.error('Error fetching albums:', error);
  }
};

const fetchGenres = async () => {
  try {
    const response = await fetch('http://localhost:8080/https://api.deezer.com/genre');
    const data = await response.json();
    genres.value = data.data.filter(genre => genre.id !== 0).slice(0, 8);
  } catch (error) {
    console.error('Error fetching genres:', error);
  }
};


// Añadir una función para limpiar filtros
const clearFilters = () => {
  router.push({
    path: '/search',
    query: {}
  });
};

// Resto de las funciones (togglePlay, addToQueue, etc.) permanecen igual
const togglePlay = (song) => {
  if (!song.readable) return

  // Si es la misma canción que está sonando, solo alternamos play/pause
  if (playerStore.currentSong?.id === song.id) {
    playerStore.togglePlay()
    return
  }

  // Si es una nueva canción
  const allTracks = results.value
  const currentIndex = allTracks.findIndex(track => track.id === song.id)
  const nextSongs = allTracks.slice(currentIndex + 1).filter(track => track.readable)

  // Iniciamos la reproducción y configuramos la cola
  playerStore.playSong(song)
  playerStore.clearQueue()
  playerStore.setQueue(nextSongs)
}

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

// Funciones de navegación
const navigateToPlaylist = (id) => {
  router.push(`/playlist/${id}`);
};

const navigateToAlbum = (id) => {
  router.push(`/album/${id}`);
};


onMounted(() => {
  // Siempre cargar las secciones de descubrimiento
  fetchPlaylists();
  fetchLatestAlbums();
  fetchGenres();

  // Si hay query o género, realizar búsqueda
  if (route.query.q || route.query.genre) {
    const filters = {
      genre: route.query.genre,
      yearFrom: route.query.yearFrom ? parseInt(route.query.yearFrom) : null,
      yearTo: route.query.yearTo ? parseInt(route.query.yearTo) : null,
      duration: route.query.duration ? parseInt(route.query.duration) : null
    };
    fetchResults(route.query.q, filters);
  }
});

// Añadir un watch para la ruta
// Actualizar el watch en SearchView.vue
watch(
  () => route.query,
  (newQuery) => {
    const filters = {
      genre: newQuery.genre,
      yearFrom: newQuery.yearFrom ? parseInt(newQuery.yearFrom) : null,
      yearTo: newQuery.yearTo ? parseInt(newQuery.yearTo) : null,
      duration: newQuery.duration ? parseInt(newQuery.duration) : null
    };
    fetchResults(newQuery.q, filters);
  },
  { immediate: true }
);
</script>


<style scoped lang="scss">

.title {
  display: flex;
  align-items: center;
  gap: 1rem;

  .song-album-image {
    width: 40px;
    height: 40px;
    border-radius: 4px;
    object-fit: cover;
  }

  .song-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
}
.discover-sections {
  padding: 2rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #333;
}

.featured-section {
  margin-bottom: 3rem;
}

.playlists-grid,
.albums-grid,
.genres-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

.playlist-card,
.album-card,
.genre-card {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-5px);
  }

  img {
    width: 100%;
    aspect-ratio: 1;
    object-fit: cover;
  }
}

.playlist-info,
.album-info {
  padding: 1rem;
  background: white;

  h3 {
    font-size: 1rem;
    margin: 0;
    font-weight: 600;
    color: #333;
  }

  p {
    font-size: 0.9rem;
    color: #666;
    margin: 0.5rem 0 0;
  }
}

.genre-card {
  position: relative;

  .genre-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
    display: flex;
    align-items: flex-end;
    padding: 1rem;

    h3 {
      color: white;
      margin: 0;
      font-size: 1.2rem;
      text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }
  }
}

// Media queries para responsividad
@media (max-width: 768px) {
  .discover-sections {
    padding: 1rem;
  }

  .playlists-grid,
  .albums-grid,
  .genres-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }
}

.results-list {
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
</style>