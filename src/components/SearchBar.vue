<!-- SearchBar.vue -->
<template>
  <div class="search-container">
    <div class="search-wrapper">
      <div class="search-input-group">
        <div class="input-icon-wrapper">
          <i class="bi bi-search search-icon"></i>
          <input 
            type="text" 
            v-model="searchQuery" 
            @keyup.enter="handleSearch"
            placeholder="Canciones, artistas, álbumes, playlists..." 
            class="search-input"
          >
          <button 
            v-if="searchQuery" 
            class="clear-input-btn"
            @click="clearSearch"
          >
            <i class="bi bi-x-circle-fill"></i>
          </button>
        </div>
      </div>

      <div class="search-actions">
        <div class="action-buttons">
          <button 
            class="btn btn--filter" 
            @click="toggleFiltersModal"
          >
            <i class="bi bi-sliders"></i>
            <span>Filtros</span>
          </button>
          
          <button 
            class="btn btn--search" 
            @click="handleSearch"
          >
            <i class="bi bi-search"></i>
            Buscar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Filtros Avanzados -->
    <div 
      v-if="showFiltersModal" 
      class="filters-modal"
    >
      <div class="filters-content">
        <div class="filters-header">
          <h3>Filtros Avanzados</h3>
          <button 
            class="close-modal-btn" 
            @click="toggleFiltersModal"
          >
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div class="filters-body">
          <div class="filter-group">
            <label>Género</label>
            <select v-model="filters.genre">
              <option value="">Todos los géneros</option>
              <option 
                v-for="genre in availableGenres" 
                :key="genre.id" 
                :value="genre.id"
              >
                {{ genre.name }}
              </option>
            </select>
          </div>

          <div class="filter-group">
            <label>Año de lanzamiento</label>
            <div class="year-range">
              <input 
                type="number" 
                v-model="filters.yearFrom"
                placeholder="Desde"
                min="1900"
                :max="currentYear"
              >
              <input 
                type="number" 
                v-model="filters.yearTo"
                placeholder="Hasta" 
                min="1900"
                :max="currentYear"
              >
            </div>
          </div>

          <div class="filter-group">
            <label>Duración máxima</label>
            <select v-model="filters.duration">
              <option value="">Sin límite</option>
              <option :value="120">2 minutos</option>
              <option :value="180">3 minutos</option>
              <option :value="300">5 minutos</option>
              <option :value="600">10 minutos</option>
            </select>
          </div>
        </div>

        <div class="filters-footer">
          <button 
            class="btn btn--secondary" 
            @click="resetFilters"
          >
            Restablecer
          </button>
          <button 
            class="btn btn--primary" 
            @click="applyFilters"
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// Props
const props = defineProps({
  initialQuery: {
    type: String,
    default: ''
  }
})

const route = useRoute()
const router = useRouter()

// Estados
const searchQuery = ref(props.initialQuery)
const showFiltersModal = ref(false)
const currentYear = new Date().getFullYear()

// Filtros
const filters = ref({
  genre: route.query.genre || '',
  yearFrom: route.query.yearFrom || '',
  yearTo: route.query.yearTo || '',
  duration: route.query.duration || ''
})

// Géneros hardcodeados (como en tu código original)
const availableGenres = ref([
  { id: 132, name: 'Hip Hop' },
  { id: 116, name: 'Rock' },
  { id: 129, name: 'Pop' },
  { id: 152, name: 'Electrónica' },
])


// En el script setup del SearchBar.vue
const fetchGenres = async () => {
  try {
    const response = await fetch('http://localhost:8080/https://api.deezer.com/genre');
    const data = await response.json();
    if (data && data.data) {
      availableGenres.value = data.data.filter(genre => genre.id !== 0);
    }
  } catch (error) {
    console.error('Error al cargar géneros:', error);
  }
};

// Cargar géneros al montar el componente
onMounted(async () => {
  await fetchGenres();
  
  // Restaurar filtros de la URL
  if (route.query.genre) filters.value.genre = route.query.genre;
  if (route.query.yearFrom) filters.value.yearFrom = route.query.yearFrom;
  if (route.query.yearTo) filters.value.yearTo = route.query.yearTo;
  if (route.query.duration) filters.value.duration = route.query.duration;
});

// Métodos
const toggleFiltersModal = () => {
  showFiltersModal.value = !showFiltersModal.value
}

const clearSearch = () => {
  searchQuery.value = ''
}

const buildSearchParams = () => {
  const query = {}
  
  // Añadir término de búsqueda si existe
  if (searchQuery.value?.trim()) {
    query.q = searchQuery.value.trim()
  }

  // Añadir filtros si tienen valor
  if (filters.value.genre) query.genre = filters.value.genre
  if (filters.value.yearFrom) query.yearFrom = filters.value.yearFrom
  if (filters.value.yearTo) query.yearTo = filters.value.yearTo
  if (filters.value.duration) query.duration = filters.value.duration

  return query
}

const handleSearch = () => {
  const query = buildSearchParams()
  
  router.push({ 
    path: '/search', 
    query 
  })
  
  showFiltersModal.value = false
}

const applyFilters = () => {
  handleSearch()
}

const resetFilters = () => {
  filters.value = {
    genre: '',
    yearFrom: '',
    yearTo: '',
    duration: ''
  }
  
  searchQuery.value = ''
  handleSearch()
}

// Cargo aquí los datos iniciales
onMounted(() => {
  // Restaurar filtros de la URL
  if (route.query.genre) filters.value.genre = route.query.genre
  if (route.query.yearFrom) filters.value.yearFrom = route.query.yearFrom
  if (route.query.yearTo) filters.value.yearTo = route.query.yearTo
  if (route.query.duration) filters.value.duration = route.query.duration
})
</script>

<style lang="scss" scoped>
// Variables
$color-primary: #A238FF;
$color-background: #F5F2F8;
$color-text: #333;
$color-border: #E1DDE4;
$spacing-base: 1rem;
$border-radius: 8px;

// Mixins
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

@mixin button-base {
  display: inline-flex;
  align-items: center;
  gap: $spacing-base * 0.5;
  padding: $spacing-base * 0.625 $spacing-base;
  border-radius: $border-radius;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
  border: none;
}


.close-modal-btn{
  border-radius: 2px;
  background-color: tomato;
  border: 0;
  color: white;
}

.close-modal-btn:hover{
  transform: scale(1.05);
  background-color: rgb(254, 108, 82);
}

// Componente
.search-container {
  position: relative;
  width: 100%;
  margin-bottom: $spacing-base * 2;
}

.search-wrapper {
  display: flex;
  align-items: center;
  background-color: $color-background;
  border-radius: $border-radius * 1.5;
  padding: $spacing-base;
  gap: $spacing-base;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.search-input-group {
  flex-grow: 1;
}

.input-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;

  .search-icon {
    position: absolute;
    left: $spacing-base * 0.75;
    color: $color-primary;
    z-index: 10;
  }
}

.search-input {
  width: 100%;
  padding: $spacing-base * 0.75 ($spacing-base * 2.5);
  border: 1px solid $color-border;
  border-radius: $border-radius;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: $color-primary;
    box-shadow: 0 0 0 2px rgba($color-primary, 0.2);
  }
}

.clear-input-btn {
  position: absolute;
  right: $spacing-base * 0.625;
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  @include flex-center;

  &:hover {
    color: $color-primary;
  }
}

.action-buttons {
  display: flex;
  gap: $spacing-base * 0.75;
}

.btn {
  @include button-base;

  &--filter {
    background-color: rgba($color-primary, 0.1);
    color: $color-primary;

    &:hover {
      background-color: rgba($color-primary, 0.2);
    }
  }

  &--search {
    background-color: $color-primary;
    color: white;
  }

  &--secondary {
    @extend .btn--filter;
  }

  &--primary {
    @extend .btn--search;
  }
}

.filters-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  @include flex-center;
  z-index: 1000;
  padding: $spacing-base;
}

.filters-content {
  background: white;
  border-radius: $border-radius * 1.5;
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-base;
  border-bottom: 1px solid $color-border;

  h3 {
    margin: 0;
    font-size: 1.2rem;
  }
}

.filters-body {
  padding: $spacing-base;

  .filter-group {
    margin-bottom: $spacing-base * 1.5;

    label {
      display: block;
      margin-bottom: $spacing-base * 0.5;
      font-weight: 600;
      color: $color-text;
    }

    select,
    input {
      width: 100%;
      padding: $spacing-base * 0.625;
      border: 1px solid $color-border;
      border-radius: $border-radius;
      font-size: 1rem;
    }
  }

  .year-range {
    display: flex;
    gap: $spacing-base;

    input {
      flex: 1;
    }
  }
}

.filters-footer {
  display: flex;
  justify-content: space-between;
  padding: $spacing-base;
  border-top: 1px solid $color-border;
}

// Responsive
@media (max-width: 768px) {
  .search-wrapper {
    flex-direction: column;
  }

  .search-input-group,
  .search-actions {
    width: 100%;
  }

  .action-buttons {
    width: 100%;
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>