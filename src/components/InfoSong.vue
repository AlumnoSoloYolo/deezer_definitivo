<template>
  <div v-if="song" class="card">
    <div class="row g-0">
      <div class="col-md-4">
        <img :src="song.album?.cover_big" class="img-fluid" :alt="song.title">
      </div>
      <div class="col-md-8">
        <div class="card-body">
          <h2 class="card-title">{{ song.title }}</h2>
          <p class="card-text">Artista: {{ song.artist?.name }}</p>
          <p class="card-text">Álbum: {{ song.album?.title }}</p>
          <p class="card-text">Duración: {{ formatDuration(song.duration) }}</p>
          
          <div class="mt-4">
            <button @click="toggleFavorite" class="btn me-2" :class="isFavorite ? 'btn-danger' : 'btn-outline-danger'">
              <i class="bi bi-heart-fill"></i> {{ isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos' }}
            </button>
            <button @click="playSong" class="btn btn-primary">
              <i class="bi bi-play-fill"></i> Reproducir
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useFavoritesStore } from '@/stores/favorites';
import { usePlayerStore } from '@/stores/player';

const props = defineProps(['id']);
const song = ref(null);
const favoritesStore = useFavoritesStore();
const playerStore = usePlayerStore();

const isFavorite = computed(() => favoritesStore.isFavorite(props.id));

const toggleFavorite = () => {
if (isFavorite.value) {
  favoritesStore.removeSong(props.id);
} else {
  favoritesStore.addSong(song.value);
}
};

const playSong = () => {
if (song.value) {
  playerStore.setQueue([song.value])
  playerStore.playSong(song.value)
}
};

const formatDuration = (seconds) => {
const minutes = Math.floor(seconds / 60);
const remainingSeconds = seconds % 60;
return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

onMounted(async () => {
try {
  const response = await fetch(`https://cors-anywhere.herokuapp.com/https://api.deezer.com/track/${props.id}`);
  song.value = await response.json();
} catch (error) {
  console.error('Error:', error);
}
});
</script>