<!-- components/MusicPlayer.vue -->
<template>
  <div class="music-player fixed-bottom p-2">
    <div class="container">
      <div class="row align-items-center">
        <div class="col-md-4">
          <div class="d-flex align-items-center" v-if="currentSong">
            <img :src="currentSong.album?.cover_small" class="me-3" :alt="currentSong.title">
            <div>
              <h6 class="mb-0 text-dark">{{ currentSong.title }}</h6>
              <small class="text-secondary">{{ currentSong.artist?.name }}</small>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="controls d-flex align-items-center justify-content-center mb-2">
            <button class="btn btn-link text-dark mx-2 p-0 control-button" @click="previousSong">
              <i class="bi bi-skip-start-fill"></i>
            </button>
            <button class="btn play-button mx-2" @click="togglePlay">
              <i :class="isPlaying ? 'bi bi-pause-fill' : 'bi bi-play-fill'"></i>
            </button>
            <button class="btn btn-link text-dark mx-2 p-0 control-button" @click="nextSong">
              <i class="bi bi-skip-end-fill"></i>
            </button>
          </div>
          <div class="progress-container">
            <div class="d-flex align-items-center">
              <small class="text-secondary me-2">{{ formatTime(currentTime) }}</small>
              <div class="progress flex-grow-1" style="height: 4px;">
                <div class="progress-bar bg-dark" :style="{width: `${progress}%`}"></div>
              </div>
              <small class="text-secondary ms-2">{{ formatTime(duration) }}</small>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="volume-control d-flex align-items-center justify-content-end">
            <div class="volume-wrapper">
              <div class="volume-slider" v-show="showVolumeControl">
                <input 
                  type="range" 
                  class="form-range" 
                  min="0" 
                  max="100" 
                  v-model="volume">
              </div>
              <button class="btn btn-link text-dark p-0" @click="toggleVolumeControl">
                <i :class="volumeIcon"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <audio
      ref="audioPlayer"
      :src="currentSong?.preview"
      @timeupdate="updateProgress"
      @loadedmetadata="handleLoadedMetadata"
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
const currentTime = ref(0);
const duration = ref(0);
const showVolumeControl = ref(false);

const currentSong = computed(() => playerStore.currentSong);
const isPlaying = computed(() => playerStore.isPlaying);
const volumeIcon = computed(() => {
  if (volume.value === 0) return 'bi bi-volume-mute';
  if (volume.value < 50) return 'bi bi-volume-down';
  return 'bi bi-volume-up';
});

const toggleVolumeControl = () => {
  showVolumeControl.value = !showVolumeControl.value;
};

const formatTime = (seconds) => {
  if (!seconds) return '00:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const togglePlay = async () => {
  if (!audioPlayer.value || !currentSong.value) return;
  try {
    if (audioPlayer.value.paused) {
      await audioPlayer.value.play().catch(error => {
        console.error('Error reproduciendo audio:', error);
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
    currentTime.value = audioPlayer.value.currentTime;
    progress.value = (audioPlayer.value.currentTime / audioPlayer.value.duration) * 100;
  }
};

const handleLoadedMetadata = () => {
  if (audioPlayer.value) {
    duration.value = audioPlayer.value.duration;
  }
};

const nextSong = () => {
  playerStore.nextSong();
};

const previousSong = () => {
  playerStore.previousSong();
};

watch(volume, (newValue) => {
  if (audioPlayer.value) {
    audioPlayer.value.volume = newValue / 100;
  }
});

const handleEnded = () => {
  playerStore.isPlaying = false;
  nextSong();
};
</script>

<style scoped>

.music-player{
  border-top: 2px solid #E1DDE4;
  background-color: #F5F2F8;
}


.progress-bar {
  transition: width 0.1s linear;
}

.play-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #A238FF;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.2s ease;

  .bi-play-fill{
    
    color: #F5F2F8;
  }

  .bi-pause-fill{
    color: #F5F2F8;
  }
}

.play-button:hover {
  transform: scale(1.05);
  background-color: #7f2bc9;
}

.play-button i {
  font-size: 1.2rem;
  color: #333;
}

.control-button i {
  font-size: 1.5rem;
}

.volume-wrapper {
  position: relative;
  display: inline-block;
}

.volume-wrapper button i {
  font-size: 1.5rem;
}

.volume-slider {
  position: absolute;
  bottom: 100%;
  right: -12px;
  background: white;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 10px;
  width: 120px;
  transform-origin: bottom right;
  animation: fadeIn 0.2s ease;
}

.volume-slider::after {
  content: '';
  position: absolute;
  bottom: -5px;
  right: 15px;
  width: 10px;
  height: 10px;
  background: white;
  transform: rotate(45deg);
  box-shadow: 2px 2px 3px rgba(0,0,0,0.1);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>