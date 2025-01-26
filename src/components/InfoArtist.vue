<template>
  <div v-if="artist" class="card">
    <img :src="artist.picture_big" class="card-img-top" :alt="artist.name">
    <div class="card-body">
      <h2 class="card-title">{{ artist.name }}</h2>
      <p>Fans: {{ artist.nb_fan }}</p>
      <div v-if="topTracks.length" class="mt-4">
        <h3>Top Tracks</h3>
        <ul class="list-group">
          <li v-for="track in topTracks" :key="track.id" class="list-group-item d-flex justify-content-between align-items-center">
            {{ track.title }}
            <div>
              <button @click="toggleFavorite(track)" class="btn btn-sm me-2" :class="isFavorite(track.id) ? 'btn-danger' : 'btn-outline-danger'">
                <i class="bi bi-heart-fill"></i>
              </button>
              <button @click="playSong(track)" class="btn btn-sm btn-primary">
                <i class="bi bi-play-fill"></i>
              </button>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
 
<script setup>
import { ref, onMounted } from 'vue';
import { usePlayerStore } from '@/stores/player';
import { useFavoritesStore } from '@/stores/favorites';

const props = defineProps(['id']);
const artist = ref(null);
const topTracks = ref([]);
const playerStore = usePlayerStore();
const favoritesStore = useFavoritesStore();

const playSong = (track) => {
playerStore.setQueue([track])
playerStore.playSong(track)
};

const isFavorite = (id) => favoritesStore.isFavorite(id);

const toggleFavorite = (song) => {
if (isFavorite(song.id)) {
  favoritesStore.removeSong(song.id);
} else {
  favoritesStore.addSong(song);
}
};
 
onMounted(async () => {
try {
  const [artistData, tracksData] = await Promise.all([
    fetch(`https://cors-anywhere.herokuapp.com/https://api.deezer.com/artist/${props.id}`),
    fetch(`https://cors-anywhere.herokuapp.com/https://api.deezer.com/artist/${props.id}/top`)
  ]);
  artist.value = await artistData.json();
  const tracks = await tracksData.json();
  topTracks.value = tracks.data.slice(0, 5);
} catch (error) {
  console.error('Error:', error);
}
});
</script>