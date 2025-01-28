<template>
  <div class="carousel-container">
    <div id="songCarousel" class="carousel slide" data-bs-ride="carousel">
      <!-- Indicadores -->
      <div class="carousel-indicators">
        <button
          v-for="(song, index) in songs"
          :key="`indicator-${song.id}`"
          type="button"
          data-bs-target="#songCarousel"
          :data-bs-slide-to="index"
          :class="{ active: index === 0 }"
          :aria-current="index === 0"
          :aria-label="`Slide ${index + 1}`"
        ></button>
      </div>

      <!-- Contenido del Carousel -->
      <div class="carousel-inner">
        <div
          v-for="(song, index) in songs"
          :key="song.id"
          :class="['carousel-item', index === 0 ? 'active' : '']"
        >
          <div class="carousel-content">
            <div class="image-container">
              <img :src="song.album.cover_big" :alt="song.title">
            </div>
            <div class="song-info">
              <h3>{{ song.title }}</h3>
              <p class="artist">{{ song.artist.name }}</p>
              <p class="album">{{ song.album.title }}</p>
              <button class="play-button" @click="playSong(song)">
                <i class="bi bi-play-fill"></i> Reproducir
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Controles -->
      <button 
        class="carousel-control-prev" 
        type="button" 
        data-bs-target="#songCarousel" 
        data-bs-slide="prev"
      >
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Previous</span>
      </button>
      <button 
        class="carousel-control-next" 
        type="button" 
        data-bs-target="#songCarousel" 
        data-bs-slide="next"
      >
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Next</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { usePlayerStore } from '../stores/player';
import * as bootstrap from 'bootstrap';

const songs = ref([]);
const playerStore = usePlayerStore();
let carousel = null;

const playSong = (song) => {
  playerStore.playSong(song);
};

onMounted(async () => {
  try {
    const response = await fetch('http://localhost:8080/https://api.deezer.com/chart');
    const data = await response.json();
    songs.value = data.tracks.data.slice(0, 5);

    // Inicializar el carousel después de que los datos se han cargado
    nextTick(() => {
      const carouselElement = document.getElementById('songCarousel');
      carousel = new bootstrap.Carousel(carouselElement, {
        interval: 5000, // Cambiar cada 5 segundos
        wrap: true      // Permite que el carousel vuelva al principio
      });
    });
  } catch (error) {
    console.error('Error fetching featured songs:', error);
  }
});
</script>

<style scoped>
.carousel-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Estilos adicionales para los controles */
.carousel-control-prev,
.carousel-control-next {
  width: 10%;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.carousel:hover .carousel-control-prev,
.carousel:hover .carousel-control-next {
  opacity: 0.8;
}

.carousel-control-prev-icon,
.carousel-control-next-icon {
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  padding: 1.5rem;
}

/* Ajustar indicadores */
.carousel-indicators {
  bottom: 20px;
  margin-bottom: 0;
}

.carousel-indicators button {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.5);
  border: none;
  margin: 0 5px;
  transition: background-color 0.3s ease;
}

.carousel-indicators button.active {
  background-color: white;
  transform: scale(1.2);
}

/* Mejorar la transición entre slides */
.carousel-item {
  transition: transform 0.6s ease-in-out;
}

.carousel {
  background: #f8f9fa;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.carousel-content {
  display: flex;
  align-items: center;
  padding: 2rem;
  background: linear-gradient(to right, #f8f9fa, #e9ecef);
  min-height: 400px;
}

.image-container {
  flex: 0 0 40%;
  padding: 1rem;
}

.image-container img {
  width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}

.song-info {
  flex: 0 0 60%;
  padding: 2rem;
}

.song-info h3 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.artist {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.album {
  color: #888;
  margin-bottom: 1.5rem;
}

.play-button {
  background: #007bff;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: background 0.2s;
}

.play-button:hover {
  background: #0056b3;
}

.carousel-indicators {
  bottom: -40px;
}

.carousel-indicators button {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin: 0 5px;
}

.carousel-control-prev,
.carousel-control-next {
  width: 5%;
  opacity: 0.7;
}

@media (max-width: 768px) {
  .carousel-content {
    flex-direction: column;
    text-align: center;
    padding: 1rem;
  }

  .image-container,
  .song-info {
    flex: 0 0 100%;
    padding: 1rem;
  }

  .song-info h3 {
    font-size: 1.5rem;
  }
}
</style>