<template>
  <div v-if="album" class="card">
    <img :src="album.cover_big" class="card-img-top" :alt="album.title">
    <div class="card-body">
      <h2 class="card-title">{{ album.title }}</h2>
      <p>Artista: {{ album.artist?.name }}</p>
      <p>Fecha: {{ new Date(album.release_date).toLocaleDateString() }}</p>
      
      <div v-if="album.tracks?.data.length" class="mt-4">
        <h3>Tracks</h3>
        <div class="list-group">
          <div v-for="track in album.tracks.data" :key="track.id" class="list-group-item">
            <div class="d-flex justify-content-between align-items-center">
              <span>{{ track.title }}</span>
              <div>
                <button @click="toggleFavorite(track)" class="btn btn-sm" :class="isFavorite(track.id) ? 'btn-danger' : 'btn-outline-danger'">
                  <i class="bi bi-heart-fill"></i>
                </button>
                <button @click="playSong(track)" class="btn btn-sm btn-primary">
                  <i class="bi bi-play-fill"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useFavoritesStore } from '@/stores/favorites';
import { usePlayerStore } from '@/stores/player';

const props = defineProps(['id']);
const album = ref(null);
const favoritesStore = useFavoritesStore();
const playerStore = usePlayerStore();

const isFavorite = (id) => favoritesStore.isFavorite(id);

const toggleFavorite = (song) => {
if (isFavorite(song.id)) {
  favoritesStore.removeSong(song.id);
} else {
  favoritesStore.addSong(song);
}
};

const playSong = (track) => {
playerStore.setQueue([track])
playerStore.playSong(track)
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