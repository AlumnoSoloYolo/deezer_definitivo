<template>
  <div class="modal-backdrop" @click="closeModal">
    <div class="modal-wrapper" @click.stop>
      <div v-if="artist" class="card border-0">
        <div class="row g-0">
          <div class="col-md-4">
            <img :src="artist.picture_big" class="img-fluid artist-cover" :alt="artist.name">
          </div>
          <div class="col-md-8">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-4">
                <h2 class="card-title">{{ artist.name }}</h2>
                <button class="btn-close" @click="closeModal"></button>
              </div>
              <p class="stat-item">
                <i class="bi bi-people-fill me-2"></i>
                {{ formatFans(artist.nb_fan) }} fans
              </p>
              
              <div v-if="topTracks.length" class="mt-4">
                <h3 class="mb-3">Top Tracks</h3>
                <div class="list-group">
                  <div 
                    v-for="track in topTracks" 
                    :key="track.id" 
                    class="list-group-item d-flex justify-content-between align-items-center border-0 py-2"
                  >
                    <span>{{ track.title }}</span>
                    <div class="track-controls">
                      <button 
                        @click="toggleFavorite(track)" 
                        class="btn btn-icon me-2"
                        :class="{'favorite-active': isFavorite(track.id)}"
                      >
                        <i class="bi bi-heart-fill"></i>
                      </button>
                      <button @click="playSong(track)" class="btn btn-icon">
                        <i class="bi bi-play-fill"></i>
                      </button>
                    </div>
                  </div>
                </div>
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
import { useRouter, useRoute } from 'vue-router';
import { usePlayerStore } from '@/stores/player';
import { useFavoritesStore } from '@/stores/favorites';

const route = useRoute();
const router = useRouter();
const artist = ref(null);
const topTracks = ref([]);
const playerStore = usePlayerStore();
const favoritesStore = useFavoritesStore();

const closeModal = () => {
  router.push(`/album/${route.params.id}`);
};

const playSong = (track) => {
  playerStore.setQueue([track]);
  playerStore.playSong(track);
};

const isFavorite = (id) => favoritesStore.isFavorite(id);

const toggleFavorite = (song) => {
  if (isFavorite(song.id)) {
    favoritesStore.removeSong(song.id);
  } else {
    favoritesStore.addSong(song);
  }
};

const formatFans = (fans) => {
  return new Intl.NumberFormat('es-ES').format(fans);
};

onMounted(async () => {
  try {
    const [artistData, tracksData] = await Promise.all([
      fetch(`https://cors-anywhere.herokuapp.com/https://api.deezer.com/artist/${route.params.artistId}`),
      fetch(`https://cors-anywhere.herokuapp.com/https://api.deezer.com/artist/${route.params.artistId}/top`)
    ]);
    artist.value = await artistData.json();
    const tracks = await tracksData.json();
    topTracks.value = tracks.data.slice(0, 5);
  } catch (error) {
    console.error('Error:', error);
  }
});
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}

.modal-wrapper {
  width: 90%;
  max-width: 800px;
  margin: 2rem;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.artist-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-title {
  font-size: 2rem;
  margin-bottom: 0;
}

.stat-item {
  font-size: 1.1rem;
  color: #666;
}

.stat-item i {
  color: #A238FF;
}

.btn-icon {
  padding: 6px;
  line-height: 1;
  color: #666;
  background: transparent;
  border: none;
  transition: all 0.2s ease;
}

.btn-icon:hover {
  color: #333;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 50%;
}

.btn-icon.favorite-active {
  color: #A238FF;
}

.btn-icon.favorite-active:hover {
  color: #8B5CF6;
}

.list-group-item {
  border-left: none;
  border-right: none;
  padding: 0.75rem 0;
}

.list-group-item:first-child {
  border-top: none;
}

.list-group-item:last-child {
  border-bottom: none;
}

@media (max-width: 768px) {
  .modal-wrapper {
    width: 95%;
    margin: 1rem;
  }
  
  .card-body {
    padding: 1rem;
  }

  .card-title {
    font-size: 1.5rem;
  }
}
</style>