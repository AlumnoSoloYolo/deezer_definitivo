<template>
  <div>
    <h1>Búsqueda de canciones en Deezer</h1>
    <!-- Componente hijo -->
    <SearchBar @results="handleResults" />
    <hr />
    
    <div class="filters mb-4">
      <div class="row">
        <div class="col-md-6">
          <div class="form-check">
            <input type="checkbox" class="form-check-input" v-model="sortAscending" id="sortCheck">
            <label class="form-check-label" for="sortCheck">
              Ordenar por nombre (ascendente)
            </label>
          </div>
        </div>
        <div class="col-md-6">
          <div class="form-group">
            <label for="duration">Duración mínima (segundos):</label>
            <input type="number" class="form-control" id="duration" v-model="minDuration" placeholder="Ejemplo: 100">
          </div>
        </div>
      </div>
    </div>

    <!-- Resultados -->
    <div v-if="songs.length" class="row g-3">
      <div v-for="song in filteredAndSortedSongs" :key="song.id" class="col-md-4">
        <div class="card h-100">
          <img :src="song.album.cover_medium" class="card-img-top" :alt="song.title">
          <div class="card-body">
            <h5 class="card-title">{{ song.title }}</h5>
            <p class="card-text">
              <router-link :to="`/info/artist/${song.artist.id}`" class="text-decoration-none">
                {{ song.artist.name }}
              </router-link>
            </p>
            <div class="d-flex justify-content-between align-items-center">
              <router-link :to="`/info/song/${song.id}`" class="btn btn-primary">
                <i class="bi bi-info-circle"></i> Detalles
              </router-link>
              <router-link :to="`/info/album/${song.album.id}`" class="btn btn-secondary">
                <i class="bi bi-disc"></i> Álbum
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
    <p v-else class="text-center mt-4">No hay resultados para mostrar</p>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import SearchBar from "../components/SearchBar.vue";

const songs = ref([]);
const sortAscending = ref(false);
const minDuration = ref(0);

const filteredAndSortedSongs = computed(() => {
  let result = [...songs.value];

  if (minDuration.value > 0) {
    result = result.filter(song => song.duration && song.duration >= minDuration.value);
  }

  if (sortAscending.value) {
    result.sort((a, b) => a.title.localeCompare(b.title));
  } else {
    result.sort((a, b) => b.title.localeCompare(a.title));
  }

  return result;
});

const handleResults = (data) => {
  songs.value = data;
};
</script>

<style scoped>
.card {
  transition: transform 0.2s;
}
.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}
</style>