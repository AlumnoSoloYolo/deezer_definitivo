<!-- components/PlaylistManager.vue -->
<template>
  <div class="playlist-manager">
    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h3 class="mb-0">Mi Playlist    <i class="bi bi-music-note-list"></i></h3>
        <span class="badge bg-primary">{{ playlist.length }} canciones</span>
      </div>
      <div class="card-body">
        <div class="list-group">
          <PlaylistItem 
            v-for="song in playlist" 
            :key="song.id" 
            :song="song" 
            @remove="removeSong"
            @play="playSong"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useFavoritesStore } from '@/stores/favorites';
import { usePlayerStore } from '@/stores/player';
import PlaylistItem from './PlaylistItem.vue';

const favoritesStore = useFavoritesStore();
const playlist = computed(() => favoritesStore.playlist);

const removeSong = (songId) => {
  favoritesStore.removeSong(songId);
};

const playerStore = usePlayerStore()

const playSong = (song) => {
  playerStore.setQueue(playlist.value)
  playerStore.playSong(song)
}


</script>