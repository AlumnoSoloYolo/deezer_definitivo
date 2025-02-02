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
            @keyup.enter="performSearch"
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
            class="btn btn-filter" 
            @click="toggleFiltersModal"
          >
            <i class="bi bi-sliders"></i>
            <span>Filtros</span>
          </button>
          
          <button 
            class="btn btn-search" 
            @click="performSearch"
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
              <option value="2">2 minutos</option>
              <option value="3">3 minutos</option>
              <option value="5">5 minutos</option>
              <option value="10">10 minutos</option>
            </select>
          </div>
        </div>

        <div class="filters-footer">
          <button 
            class="btn btn-reset" 
            @click="resetFilters"
          >
            Restablecer
          </button>
          <button 
            class="btn btn-apply" 
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
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// Estados
const searchQuery = ref(route.query.q || '')
const showFiltersModal = ref(false)
const currentYear = new Date().getFullYear()

// Filtros
const filters = ref({
  genre: route.query.genre || '',
  yearFrom: route.query.yearFrom || '',
  yearTo: route.query.yearTo || '',
  duration: route.query.duration || ''
})

// Géneros (simular datos de tu API)
const availableGenres = ref([
  { id: 132, name: 'Hip Hop' },
  { id: 116, name: 'Rock' },
  { id: 129, name: 'Pop' },
  { id: 152, name: 'Electrónica' },
  // Añade más géneros
])

// Métodos
const toggleFiltersModal = () => {
  showFiltersModal.value = !showFiltersModal.value
}

const clearSearch = () => {
  searchQuery.value = ''
}

const performSearch = () => {
  const query = {}
  
  // Añadir término de búsqueda si existe
  if (searchQuery.value) {
    query.q = searchQuery.value
  }

  // Aplicar filtros independientemente del término de búsqueda
  if (filters.value.genre) query.genre = filters.value.genre
  if (filters.value.yearFrom) query.yearFrom = filters.value.yearFrom
  if (filters.value.yearTo) query.yearTo = filters.value.yearTo
  if (filters.value.duration) query.duration = filters.value.duration

  // Si no hay ni búsqueda ni filtros, usar un término genérico para mostrar resultados
  if (Object.keys(query).length === 0) {
    query.q = 'music' // Término genérico para mostrar resultados
  }

  // Navegar a la página de búsqueda con los parámetros
  router.push({ 
    path: '/search', 
    query: query 
  })
  
  // Cerrar el modal de filtros
  showFiltersModal.value = false
}



const applyFilters = () => {
  performSearch()
}

const resetFilters = () => {
  // Resetear todos los filtros
  filters.value = {
    genre: '',
    yearFrom: '',
    yearTo: '',
    duration: ''
  }
  
  // Limpiar también el término de búsqueda
  searchQuery.value = ''
  
  // Realizar búsqueda
  performSearch()
}

// Cargar query inicial
onMounted(() => {
  // Restaurar filtros de la URL
  if (route.query.genre) filters.value.genre = route.query.genre
  if (route.query.yearFrom) filters.value.yearFrom = route.query.yearFrom
  if (route.query.yearTo) filters.value.yearTo = route.query.yearTo
  if (route.query.duration) filters.value.duration = route.query.duration
})
</script>

<style lang="scss" scoped>
// Colores basados en tu diseño
$primary-color: #A238FF;
$background-color: #F5F2F8;
$text-color: #333;
$border-color: #E1DDE4;

.search-container {
  position: relative;
  width: 100%;
  margin-bottom: 2rem;
}

.search-wrapper {
  display: flex;
  align-items: center;
  background-color: $background-color;
  border-radius: 12px;
  padding: 1rem;
  gap: 1rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

.search-input-group {
  flex-grow: 1;
}

.input-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: $primary-color;
  z-index: 10;
}

.search-input {
  width: 100%;
  padding: 0.75rem 2.5rem;
  padding-right: 40px;
  border: 1px solid $border-color;
  border-radius: 8px;
  background-color: white;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: $primary-color;
    box-shadow: 0 0 0 2px rgba($primary-color, 0.2);
  }
}

.clear-input-btn {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: $primary-color;
  }
}

.search-actions {
  display: flex;
  align-items: center;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
  border: none;
}

.btn-filter {
  background-color: rgba($primary-color, 0.1);
  color: $primary-color;

  &:hover {
    background-color: rgba($primary-color, 0.2);
  }

  i {
    font-size: 1.2rem;
  }
}

.btn-search {
  background-color: $primary-color;
  color: white;

}

// Modal de Filtros
.filters-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.filters-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid $border-color;

  h3 {
    margin: 0;
    font-size: 1.2rem;
  }

  .close-modal-btn {
    background: none;
    border: none;
    color: #666;
    cursor: pointer;
    font-size: 1.2rem;

    &:hover {
      color: $primary-color;
    }
  }
}

.filters-body {
  padding: 1rem;

  .filter-group {
    margin-bottom: 1.5rem;

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: $text-color;
    }

    select, input {
      width: 100%;
      padding: 0.625rem;
      border: 1px solid $border-color;
      border-radius: 8px;
      font-size: 1rem;
    }
  }

  .year-range {
    display: flex;
    gap: 1rem;

    input {
      flex: 1;
    }
  }
}

.filters-footer {
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  border-top: 1px solid $border-color;

  .btn-reset {
    background-color: rgba($primary-color, 0.1);
    color: $primary-color;

    &:hover {
      background-color: rgba($primary-color, 0.2);
    }
  }

  .btn-apply {
    background-color: $primary-color;
    color: white;

  }
}

// Responsive
@media (max-width: 768px) {
  .search-wrapper {
    flex-direction: column;
    gap: 1rem;
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