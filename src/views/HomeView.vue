<template>
  
    <SearchBar />
    <SongCarousel class="my-4"/>
    <WelcomeModal />
    
  
 </template>
 
 <script setup>
 import { useRouter } from 'vue-router';
 import SearchBar from '@/components/SearchBar.vue';
 import SongCarousel from '@/components/SongCarousel.vue';
 import WelcomeModal from '@/components/WelcomeModal.vue';
 
 const router = useRouter();
 
 const handleSearch = (query) => {
  router.push({ 
    name: 'Buscador',
    query: { q: query }
  });
 };
 </script>
 
 <style lang="scss">
 .sass-example {
  .psass {
    background: #f5f5f5;
    padding: 1rem;
    border-radius: 5px;
    
    ul {
      margin-top: 1rem;
      li {
        color: #333;
        margin-bottom: 0.5rem;
        
        &:before {
          content: "→";
          margin-right: 0.5rem;
          color: #007bff;
        }
      }
    }
  }
 }
 
 code {
  display: inline-block;
  margin: 0.5rem 0;
  padding: 0.2rem 0.5rem;
  background: #f8f9fa;
  border-radius: 3px;
 }
 </style>