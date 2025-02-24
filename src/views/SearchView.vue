
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
            <div class="header-cell title-cell">Título</div>
            <div class="header-cell">Artista</div>
            <div class="header-cell album-cell">Álbum</div>
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
            <!-- Número y botón play -->
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

            <!-- Título con imagen y detalles -->
            <div class="title">
              <img 
                v-if="item.album?.cover_small" 
                :src="item.album.cover_small" 
                :alt="item.title" 
                class="song-album-image"
              >
              <div class="song-info">

                <div>    <router-link 
                  :to="`/song/${item.id}`" 
                  class="song-title-link"
                >
                  {{ item.title }}
                </router-link></div>
            
                
                <span v-if="item.explicit_lyrics" class="explicit-badge">E</span>
              </div>
            </div>

            <!-- Artista columna -->
            <div class="artist">
              <router-link :to="`/artist/${item.artist.id}`">
                {{ item.artist.name }}
              </router-link>
            </div>

            <!-- Álbum columna -->
            <div class="album album-cell">
              <router-link :to="`/album/${item.album.id}`">
                {{ item.album.title }}
              </router-link>
            </div>

            <!-- Acciones y duración -->
            <div class="actions">
              <div class="song-actions">
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

const fetchResults = async (query, filters) => {
  console.log('Iniciando búsqueda con:', { query, filters });
  loading.value = true;
  hasSearched.value = true;
  results.value = [];

  try {
    let baseUrl = 'http://localhost:8080/https://api.deezer.com/search';
    let searchTerms = [];

    if (query?.trim()) {
      searchTerms.push(query.trim());
    }

    if (filters?.genre) {
      const genreResponse = await fetch(`http://localhost:8080/https://api.deezer.com/genre/${filters.genre}`);
      const genreData = await genreResponse.json();
      if (genreData && genreData.name) {
        searchTerms.push(`genre:"${genreData.name}"`);
      }
    }

    const searchQuery = searchTerms.join(' ') || 'track';
    const urlParams = new URLSearchParams();
    urlParams.append('q', searchQuery);
    urlParams.append('limit', '50');

    const url = `${baseUrl}?${urlParams.toString()}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data || !data.data) {
      throw new Error('No se encontraron datos');
    }

    let filteredResults = [...data.data]; // Crear una copia de los resultados

    // Si hay filtro de año
    if (filters?.yearFrom || filters?.yearTo) {
      console.log('Obteniendo detalles de álbumes para filtrar por año...');
      
      // Obtener detalles de álbumes
      const albumDetails = await Promise.all(
        filteredResults.map(async track => {
          try {
            const albumResponse = await fetch(`http://localhost:8080/https://api.deezer.com/album/${track.album.id}`);
            const albumData = await albumResponse.json();
            return {
              trackId: track.id,
              albumData: albumData
            };
          } catch (error) {
            console.error(`Error al obtener álbum para track ${track.id}:`, error);
            return {
              trackId: track.id,
              albumData: null
            };
          }
        })
      );

      // Crear mapa de álbumes
      const albumMap = new Map(
        albumDetails.map(detail => [detail.trackId, detail.albumData])
      );

      // Filtrar por año
      filteredResults = filteredResults.filter(track => {
        const albumData = albumMap.get(track.id);
        if (!albumData?.release_date) return false;

        const releaseYear = new Date(albumData.release_date).getFullYear();
        const fromYear = filters.yearFrom ? parseInt(filters.yearFrom) : 0;
        const toYear = filters.yearTo ? parseInt(filters.yearTo) : 9999;

        const isInRange = releaseYear >= fromYear && releaseYear <= toYear;
        console.log(`${track.title} (${releaseYear}): ${isInRange ? 'En rango' : 'Fuera de rango'} ${fromYear}-${toYear}`);

        return isInRange;
      });

      console.log(`Encontrados ${filteredResults.length} tracks en el rango de años`);
    }

    // Aplicar filtro de duración
    if (filters?.duration) {
      filteredResults = filteredResults.filter(track => 
        track.duration <= parseInt(filters.duration)
      );
    }

    // Asignar los resultados filtrados
    results.value = filteredResults;
    console.log('Resultados finales:', results.value);

  } catch (error) {
    console.error('Error en la búsqueda:', error);
    results.value = [];
  } finally {
    loading.value = false;
  }
};

// Funciones de reproducción y cola
const togglePlay = (song) => {
  if (!song.readable) return;

  if (playerStore.currentSong?.id === song.id) {
    playerStore.togglePlay();
    return;
  }

  const allTracks = results.value;
  const currentIndex = allTracks.findIndex(track => track.id === song.id);
  const nextSongs = allTracks.slice(currentIndex + 1).filter(track => track.readable);

  playerStore.playSong(song);
  playerStore.clearQueue();
  playerStore.setQueue(nextSongs);
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

// Funciones de navegación
const navigateToPlaylist = (id) => {
  router.push(`/playlist/${id}`);
};

const navigateToAlbum = (id) => {
  router.push(`/album/${id}`);
};

const searchByGenre = async (genreId) => {
  try {
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

// Funciones de carga de datos
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

// En SearchView.vue
watch(
  () => route.query,
  (newQuery) => {
    console.log('Query actualizada:', newQuery); // Añadir este log
    
    const filters = {
      genre: newQuery.genre,
      yearFrom: newQuery.yearFrom ? parseInt(newQuery.yearFrom) : null,
      yearTo: newQuery.yearTo ? parseInt(newQuery.yearTo) : null,
      duration: newQuery.duration ? parseInt(newQuery.duration) : null
    };
    
    console.log('Filtros procesados:', filters); // Añadir este log
    
    // Asegurarnos de pasar siempre una query, aunque sea vacía
    fetchResults(newQuery.q || '', filters);
  },
  { immediate: true }
);
// Inicialización
onMounted(() => {
  fetchPlaylists();
  fetchLatestAlbums();
  fetchGenres();

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
</script>


<style lang="scss" scoped>


.loading, .no-results {
  text-align: center;
  padding: 2rem;
  color: #666;
}

// Estilos para la sección de descubrimiento
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

// Estilos para la lista de resultados
.results-list {
  margin-top: 2rem;

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
    }
  }

  .song-row {
    display: grid;
    grid-template-columns: 50px minmax(300px, 3fr) minmax(150px, 2fr) minmax(150px, 2fr) 120px;
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
  }
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

  .song-album-image {
    width: 40px;
    height: 40px;
    border-radius: 4px;
    object-fit: cover;
  }

  .song-info {
    display: flex;
    flex-direction: row;
    gap: 0.3rem;

    .song-title-link {
      color: inherit;
      text-decoration: none;
      font-weight: 500;
      
      &:hover {
        text-decoration: underline;
        color: #A238FF;
      }
    }

    .song-details {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: #666;

      a {
        color: #666;
        text-decoration: none;
        
        &:hover {
          text-decoration: underline;
          color: #A238FF;
        }
      }

      .separator {
        color: #999;
      }
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

.song-info {
  .song-title-wrapper {
    display: flex;
    align-items: center;
    gap: 0.5rem;
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

// Media queries para responsividad
@media (max-width: 1200px) {
  .playlists-grid,
  .albums-grid,
  .genres-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .song-row, .header-row {
    grid-template-columns: 50px minmax(250px, 3fr) minmax(150px, 2fr) minmax(150px, 2fr) 120px;
  }
}

@media (max-width: 992px) {
  .playlists-grid,
  .albums-grid,
  .genres-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .song-row, .header-row {
    grid-template-columns: 50px minmax(200px, 3fr) minmax(120px, 2fr) 120px;
  }
  
  .album-cell {
    display: none;
  }
}

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
</style>