<template>
  <div class="carousel-container">
    <AnimatedMountainsCarousel />
    <div 
      ref="carouselRef"
      id="songCarousel" 
      class="carousel slide" 
      data-bs-ride="carousel"
    >
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
              <router-link 
                    :to="`/song/${song.id}`" 
                    class="song-title-link"
                  >
                  <img :src="song.album.cover_big" :alt="song.title" class="album-cover">
                  </router-link>
              <div class="album-cover-overlay"></div>
            </div>
            <div class="song-info">
              <h3 class="song-title">{{ song.title }}</h3>
              <div class="artist">
                <router-link :to="'/artist/' + song.artist.id" class="artist-link">
                  {{ song.artist.name }}
                </router-link>
              </div>
              <p class="album-title">{{ song.album.title }}</p>
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
import { ref, onMounted, onUnmounted } from 'vue';
import { usePlayerStore } from '../stores/player';
import Carousel from 'bootstrap/js/dist/carousel';
import AnimatedMountainsCarousel from './AnimatedMountainsCarousel.vue';
import { useFavoritesStore } from '../stores/favorites';
const favoritesStore = useFavoritesStore();
const songs = ref([]);
const playerStore = usePlayerStore();
const carouselRef = ref(null);
let carouselInstance = null;

const playSong = (song) => {
  playerStore.playSong(song);
};

const handleFavorite = (song) => {
  if (favoritesStore.isFavorite(song.id)) {
    favoritesStore.removeSong(song.id);
  } else {
    favoritesStore.addSong(song);
  }
};

onMounted(async () => {
  try {
    const response = await fetch('http://localhost:8080/https://api.deezer.com/chart');
    const data = await response.json();
    songs.value = data.tracks.data.slice(0, 5);

    // Esperar a que el dom esté listo
    setTimeout(() => {
      if (carouselRef.value) {
        // Inicializamos el carousel
        carouselInstance = new Carousel(carouselRef.value, {
          interval: 5000,
          ride: true,
          pause: false
        });
      }
    }, 100);
  } catch (error) {
    console.error('Error fetching featured songs:', error);
  }
});

// Limpiar el carousel cuando el componente se desmonte
onUnmounted(() => {
  if (carouselInstance) {
    carouselInstance.dispose();
  }
});
</script>

<style lang="scss" scoped>
.carousel-container {
  position: relative;
  height: 500px;
  width: 100%;
  overflow: hidden;
  color: white;
  background-color: #0F0D13;
}

.carousel-inner {
  height: 100%;
  position: relative;
  z-index: 2;
}

.carousel-item {
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  opacity: 0;
  transition: opacity 0.6s ease;
  pointer-events: none;

  &.active {
    opacity: 1;
    z-index: 2;
    pointer-events: auto;
  }
}

.carousel-content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 2rem;
  position: relative;
  z-index: 3;
}

.carousel-control-prev,
.carousel-control-next {
  margin: 2rem;
  width: 50px;
  height: 50px;
  top: 50%;
  transform: translateY(-50%);
  border-radius: 50%;
  transition: background-color 0.3s ease;
  z-index: 4;

  &:hover {
    background-color: rgba(255,255,255,0.3);
  }

  .carousel-control-prev-icon,
  .carousel-control-next-icon {
    width: 30px;
    height: 30px;
    filter: invert(1) grayscale(100%) brightness(200%);
  }
}
.carousel-container {
  position: relative;
  height: 500px;
  width: 100%;
  overflow: hidden;
  color: white;
  border-radius: 30px;
}

.carousel-inner {
  height: 100%;
  position: relative;
  z-index: 2;
}

.carousel-item {
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  opacity: 0;
  transition: opacity 0.6s ease;

  &.active {
    opacity: 1;
    z-index: 2;
  }
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

.carousel-content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 2rem;
  position: relative;
  z-index: 3;
}

.carousel-container {
  position: relative;
  height: 500px;
  width: 100%;
  overflow: hidden;
  color: white;
}

.carousel-inner {
  height: 100%;
}

.carousel-item {
  height: 100%;
  position: relative;
}

.carousel-content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 2rem;
  position: relative;
  z-index: 2;
}

.image-container {
  flex: 0 0 350px;
  position: relative;
  margin-right: 2rem;
  
  .album-cover {
    width: 350px;
    height: 350px;
    object-fit: cover;
    border-radius: 12px;
    box-shadow: 0 15px 35px rgba(0,0,0,0.4);
    position: relative;
    z-index: 1;
  }

}

.song-info {
  flex: 1;
  max-width: 500px;
  
  .song-title {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    color: white;
    text-shadow: 0 4px 6px rgba(0,0,0,0.3);
  }

  .artist {
    margin-bottom: 0.75rem;
    
    .artist-link {
      font-size: 1.5rem;
      color: rgba(255,255,255,0.8);
      text-decoration: none;
      transition: color 0.3s ease;

      &:hover {
        color: #A238FF;
      }
    }
  }

  .album-title {
    font-size: 1rem;
    color: rgba(255,255,255,0.7);
    margin-bottom: 1.5rem;
  }

  .play-button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background-color: #A238FF;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    transition: all 0.3s ease;
    box-shadow: 0 6px 12px rgba(162, 56, 255, 0.4);

    &:hover {
      background-color: #8A19E6;
      transform: translateY(-3px);
      box-shadow: 0 8px 15px rgba(162, 56, 255, 0.5);
    }

    i {
      font-size: 1.2rem;
    }
  }
}

.carousel-control-prev,
.carousel-control-next {
  width: 50px;
  height: 50px;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(255,255,255,0.1);
  border-radius: 50%;
  transition: all 0.3s ease;

  &:hover {
    background-color: rgba(255,255,255,0.2);
  }

  .carousel-control-prev-icon,
  .carousel-control-next-icon {
    width: 30px;
    height: 30px;
  }
}

.carousel-indicators {
  bottom: 20px;
  
  button {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: rgba(255,255,255,0.5);
    opacity: 0.5;
    transition: all 0.3s ease;

    &.active {
      width: 12px;
      height: 12px;
      background-color: #A238FF;
      opacity: 1;
    }
  }
}

@media (max-width: 992px) {
  .carousel-content {
    flex-direction: column;
    text-align: center;
  }

  .image-container {
    margin-right: 0;
    margin-bottom: 1.5rem;

    .album-cover {
      width: 250px;
      height: 250px;
    }
  }

  .song-info {
    .song-title {
      font-size: 2rem;
    }

    .artist {
      .artist-link {
        font-size: 1.2rem;
      }
    }
  }
}

</style>