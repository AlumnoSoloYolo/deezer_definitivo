<!-- components/MusicPlayer.vue -->
<template>
  <div class="music-player fixed-bottom bg-dark text-white p-3">
    <div class="container">
      <div class="row align-items-center">
        <div class="col-md-4">
          <div class="d-flex align-items-center" v-if="currentSong">
            <img :src="currentSong.album?.cover_small" class="me-3" :alt="currentSong.title">
            <div>
              <h6 class="mb-0">{{ currentSong.title }}</h6>
              <small>{{ currentSong.artist?.name }}</small>
            </div>
          </div>
        </div>
        
        <div class="col-md-4">
          <div class="controls text-center">
            <button class="btn btn-sm btn-outline-light mx-2" @click="previousSong">
              <i class="bi bi-skip-backward-fill"></i>
            </button>
            <button class="btn btn-sm btn-outline-light mx-2" @click="togglePlay">
              <i :class="isPlaying ? 'bi bi-pause-fill' : 'bi bi-play-fill'"></i>
            </button>
            <button class="btn btn-sm btn-outline-light mx-2" @click="nextSong">
              <i class="bi bi-skip-forward-fill"></i>
            </button>
          </div>
          <div class="progress mt-2" style="height: 4px;">
            <div class="progress-bar" :style="{width: `${progress}%`}"></div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="volume-control d-flex align-items-center justify-content-end">
            <i class="bi bi-volume-up me-2"></i>
            <input type="range" class="form-range" min="0" max="100" v-model="volume">
          </div>
        </div>
      </div>
    </div>
    <audio 
      ref="audioPlayer"
      :src="currentSong?.preview"
      @timeupdate="updateProgress"
      @ended="handleEnded">
    </audio>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { usePlayerStore } from '@/stores/player';

const playerStore = usePlayerStore();
const audioPlayer = ref(null);
const progress = ref(0);
const volume = ref(50);

const currentSong = computed(() => playerStore.currentSong);
const isPlaying = computed(() => playerStore.isPlaying);

const togglePlay = async () => {
  if (!audioPlayer.value || !currentSong.value) return;
  
  try {
    if (audioPlayer.value.paused) {
      await audioPlayer.value.play().catch(error => {
        console.error('Error reproduciendo audio:', error);
        // Mostrar mensaje al usuario
      });
      playerStore.isPlaying = true;
    } else {
      audioPlayer.value.pause();
      playerStore.isPlaying = false;
    }
  } catch (error) {
    console.error('Error en reproducción:', error);
  }
};
watch(currentSong, async (newSong) => {
  if (newSong && audioPlayer.value) {
    try {
      audioPlayer.value.src = newSong.preview;
      await audioPlayer.value.load();
      if (playerStore.isPlaying) {
        await audioPlayer.value.play();
      }
    } catch (error) {
      console.error('Error loading audio:', error);
      playerStore.isPlaying = false;
    }
  }
});

const updateProgress = () => {
 if (audioPlayer.value) {
   progress.value = (audioPlayer.value.currentTime / audioPlayer.value.duration) * 100;
 }
};

const nextSong = () => {
 playerStore.nextSong();
};

const previousSong = () => {
 playerStore.previousSong();
};

// watch(volume, (newValue) => {
//  if (audioPlayer.value) {
//    audioPlayer.value.volume = newValue / 100;
//  }
// });


const handleEnded = () => {
 playerStore.isPlaying = false;
 nextSong();
};
</script>