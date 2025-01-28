<!-- SearchBar.vue -->
<template>
  <div class="search-container px-3">
    <div class="search-wrapper">
      <div class="search-input">
        <input
          type="text"
          v-model="searchQuery"
          @keyup.enter="searchDeezer"
          placeholder="Canciones, artistas, podcasts..."
        />
        <button @click="searchDeezer">
          <i class="bi bi-search"></i>
        </button>
        <button @click="toggleFilters" class="filter-toggle">
          <i class="bi" :class="{'bi-funnel-fill': showFilters, 'bi-funnel': !showFilters}"></i>
        </button>
      </div>

      <!-- Panel de filtros desplegable -->
      <div class="filters-panel" :class="{ 'show': showFilters }">
        <div class="filter-group">
          <select v-model="filters.genre" @change="searchDeezer">
            <option value="">Todos los géneros</option>
            <option value="132">Pop</option>
            <option value="152">Rock</option>
            <option value="116">Rap/Hip-Hop</option>
            <option value="464">Latino</option>
            <option value="113">Dance</option>
            <option value="165">R&B</option>
            <option value="144">Reggae</option>
            <option value="129">Jazz</option>
            <option value="98">Clásica</option>
            <option value="173">Películas/Games</option>
          </select>

          <select v-model="filters.year" @change="searchDeezer">
            <option value="">Todos los años</option>
            <option value="2020">2020s</option>
            <option value="2010">2010s</option>
            <option value="2000">2000s</option>
            <option value="1990">1990s</option>
            <option value="1980">1980s</option>
            <option value="1970">1970s</option>
            <option value="1960">1960s</option>
            <option value="older">Anterior a 1960</option>
          </select>

          <div class="duration-filter">
            <label>Duración máx. (min)</label>
            <input 
              type="number" 
              v-model="filters.maxDuration"
              min="1" 
              max="30"
              @change="searchDeezer"
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRouter, useRoute } from 'vue-router';

const props = defineProps({
  initialQuery: {
    type: String,
    default: ''
  }
});

const router = useRouter();
const route = useRoute();
const searchQuery = ref(props.initialQuery);
const showFilters = ref(false);
const filters = reactive({
  genre: '',
  year: '',
  maxDuration: 30
});

const toggleFilters = () => {
  showFilters.value = !showFilters.value;
};

const searchDeezer = () => {
  // Si estamos en la página de inicio, redirigimos
  if (route.path === '/') {
    router.push({
      path: '/search',
      query: { 
        q: searchQuery.value,
        genre: filters.genre,
        year: filters.year,
        duration: filters.maxDuration
      }
    });
  } else {
    // Si ya estamos en la página de búsqueda, actualizamos la query
    router.replace({ 
      query: { 
        q: searchQuery.value,
        genre: filters.genre,
        year: filters.year,
        duration: filters.maxDuration
      }
    });
  }
};
</script>

<style scoped>
.search-container {
  display: flex;
  align-items: center;
  border-bottom: 2px solid #E1DDE4;
  width: 100%;
}

.search-wrapper {
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.search-input {
  width: 65%;
  display: flex;
  align-items: center;
  border-radius: 8px;
  background-color: #E1DDE4;
  padding: 0;
}

.search-input input {
  
  border: none;
  outline: none;
  padding: 10px;
  font-size: 1.1rem;
  color: #000000;
  background-color: #E1DDE4;
  border-radius: 8px;
}

.search-input button {
  border: none;
  background-color: transparent;
  padding: 0 10px;
  cursor: pointer;
  color: #777;
  font-size: 20px;
}

.search-input button:hover {
  color: #000;
}

.filter-toggle {
  border-left: 1px solid #ddd;
}

.filters-panel {
  width: 100%;
  max-height: 0;
  overflow: hidden;
  transition: all 0.3s ease-out;
  background: white;
  margin-top: 20px;
  opacity: 0;
}

.filters-panel.show {
  max-height: 500px;
  opacity: 1;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  margin-top: 10px;
  background-color: #f8f9fa;
}

select, input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  background-color: white;
}

.duration-filter {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.duration-filter input {
  width: 100%;
}
</style>