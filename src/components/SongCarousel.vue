<template>
    <div id="songCarousel" class="carousel slide" data-bs-ride="carousel">
      <div class="carousel-inner">
        <div v-for="(song, index) in songs" :key="song.id" 
             :class="['carousel-item', index === 0 ? 'active' : '']">
          <img :src="song.album.cover_big" class="d-block w-100" :alt="song.title">
          <div class="carousel-caption">
            <h5>{{ song.title }}</h5>
            <p>{{ song.artist.name }}</p>
          </div>
        </div>
      </div>
      <button class="carousel-control-prev" type="button" data-bs-target="#songCarousel" data-bs-slide="prev">
        <span class="carousel-control-prev-icon"></span>
      </button>
      <button class="carousel-control-next" type="button" data-bs-target="#songCarousel" data-bs-slide="next">
        <span class="carousel-control-next-icon"></span>
      </button>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  
  const songs = ref([]);
  
  onMounted(async () => {
    try {
      const response = await fetch('https://cors-anywhere.herokuapp.com/https://api.deezer.com/chart');
      const data = await response.json();
      songs.value = data.tracks.data.slice(0, 5);
    } catch (error) {
      console.error('Error fetching featured songs:', error);
    }
  });
  </script>