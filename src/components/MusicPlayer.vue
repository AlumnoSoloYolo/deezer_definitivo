

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

const togglePlay = () => {
  if (!audioPlayer.value || !currentSong.value) return;
  playerStore.togglePlay();
};

watch(() => playerStore.isPlaying, (isPlaying) => {
  if (isPlaying) {
    audioPlayer.value.play().catch(error => {
      console.error('Error reproduciendo audio:', error);
    });
  } else {
    audioPlayer.value.pause();
  }
});

watch(currentSong, async (newSong) => {
  if (newSong && audioPlayer.value) {
    try {
      audioPlayer.value.src = newSong.preview;
      await audioPlayer.value.load();
      if (playerStore.isPlaying) {
        audioPlayer.value.play();
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


<template>
  <div class="music-player fixed-bottom">
    <div class="player-grid">
    
      <div class="song-info" v-if="currentSong">
        <img :src="currentSong.album?.cover_small" :alt="currentSong.title">
        <div class="song-details">
          <h6 class="mb-0">{{ currentSong.title }}</h6>
          <small class="text-secondary">{{ currentSong.artist?.name }}</small>
        </div>
      </div>

    
      <div class="player-controls">
        <button class="btn btn-link text-dark control-button" @click="previousSong">
          <i class="bi bi-skip-start-fill"></i>
        </button>
        <button class="btn play-button" @click="togglePlay">
          <i :class="isPlaying ? 'bi bi-pause-fill' : 'bi bi-play-fill'"></i>
        </button>
        <button class="btn btn-link text-dark control-button" @click="nextSong">
          <i class="bi bi-skip-end-fill"></i>
        </button>
      </div>

     
      <div class="volume-control">
        <input type="range" class="volume-range" min="0" max="100" v-model="volume">
        <button class="btn btn-link text-dark volume-button" @click="toggleMute">
          <i :class="volumeIcon"></i>
        </button>
      </div>

     
      <div class="progress-container">
        <span class="time">{{ formatTime(currentTime) }}</span>
        <div class="progress">
          <div class="progress-bar" :style="{width: `${progress}%`}"></div>
        </div>
        <span class="time">{{ formatTime(duration) }}</span>
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

<style lang="scss" scoped>

$primary-color: #A238FF;
$background-color: #F5F2F8;
$border-color: #E1DDE4;

.music-player {
  border-top: 2px solid $border-color;
  background-color: $background-color;
  padding: 1rem;
  height: auto;
}

.player-grid {
  display: grid;
  grid-template-columns: minmax(200px, 1fr) auto minmax(150px, 1fr);
  grid-template-rows: auto auto;
  gap: 1rem;
  align-items: center;

  .progress-container {
    grid-column: 1 / -1;
    grid-row: 2;
  }
}

.song-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 0;

  img {
    width: 40px;
    height: 40px;
    border-radius: 4px;
  }

  .song-details {
    min-width: 0;
    h6 {
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    small {
      display: block;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}

.player-controls {
  grid-column: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin: 0 auto;
  padding: 0;
  min-width: 180px;

  .control-button {
    padding: 0;
    i {
      font-size: 1.5rem;
    }
  }

  .play-button {
    width: 35px;
    height: 35px;
    border-radius: 50%;
    background-color: $primary-color;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    i {
      color: white;
      font-size: 1.2rem;
    }

    &:hover {
      transform: scale(1.05);
      background-color: darken($primary-color, 10%);
    }
  }
}

.volume-control {
  justify-self: end;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-left: 1rem;

  .volume-range {
    width: 100px;
    height: 4px;
    -webkit-appearance: none;
    background: rgba($primary-color, 0.2);
    border-radius: 2px;
    
    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 12px;
      height: 12px;
      background: $primary-color;
      border-radius: 50%;
      cursor: pointer;
    }

    &::-moz-range-thumb {
      width: 12px;
      height: 12px;
      background: $primary-color;
      border-radius: 50%;
      cursor: pointer;
      border: none;
    }
  }

  .volume-button {
    padding: 0;
    i {
      font-size: 1.5rem;
    }
  }
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 1rem;

  .time {
    font-size: 0.75rem;
    color: #666;
    min-width: 45px;
  }

  .progress {
    flex: 1;
    height: 4px;
    background-color: rgba($primary-color, 0.2);
    border-radius: 2px;
    cursor: pointer;
    position: relative;

    .progress-bar {
      background-color: $primary-color;
      height: 100%;
      border-radius: 2px;
      transition: width 0.1s linear;
    }

    &:hover {
      .progress-bar {
        background-color: darken($primary-color, 10%);
      }
    }
  }
}

@media (max-width: 768px) {
  .player-grid {
    grid-template-columns: minmax(150px, 1fr) auto minmax(100px, 1fr);
    gap: 0.5rem;
  }

  .song-info {
    gap: 0.5rem;
    .song-details {
      h6 { font-size: 0.9rem; }
      small { font-size: 0.8rem; }
    }
  }

  .player-controls {
    min-width: 150px;
    gap: 0.5rem;
  }

  .volume-control {
    .volume-range {
      width: 60px;
    }
  }
}

@media (max-width: 480px) {
 
  
  .player-grid {
    grid-template-columns: minmax(120px, 1fr) auto minmax(80px, 1fr);
  }

  .player-controls {
    min-width: 120px;
    
    .control-button i {
      font-size: 1.2rem;
    }
    
    .play-button {
      width: 32px;
      height: 32px;
    }
  }

  .volume-control {
    .volume-range {
      width: 40px;
    }
    
    .volume-button i {
      font-size: 1.2rem;
    }
  }
}
</style>