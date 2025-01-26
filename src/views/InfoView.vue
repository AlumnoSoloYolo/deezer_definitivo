<template>
    <div class="container">
      <InfoArtist v-if="type === 'artist'" :id="id" />
      <InfoAlbum v-if="type === 'album'" :id="id" />
      <InfoSong v-if="type === 'song'" :id="id" />
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import InfoArtist from '@/components/InfoArtist.vue';
  import InfoAlbum from '@/components/InfoAlbum.vue';
  import InfoSong from '@/components/InfoSong.vue';
  
  const route = useRoute();
  const type = route.params.type;
  const id = route.params.id;
  </script>