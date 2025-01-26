<template>
  <div class="container">
    <SearchBar @search="handleSearch"/>
    <SongCarousel class="my-4"/>
    
    <div class="row">
      <div class="col-md-6">
        <h1>Bootstrap Icons</h1>
        <p>Bootstrap Icons es una biblioteca de iconos creada por el equipo de Bootstrap. Proporciona una colección de iconos SVG gratuitos y de código abierto.</p>
        <div class="text-bg-light p-3 border">
          <i class="bi bi-alarm" style="font-size: 2rem; color: cornflowerblue;"></i>
          <code>&lt;i class="bi bi-alarm" style="font-size: 2rem; color: cornflowerblue;"&gt;&lt;/i&gt;</code>
          <br>
          <i class="bi bi-battery-half" style="font-size: 2rem; color: darkorange;"></i>
          <code>&lt;i class="bi bi-battery-half" style="font-size: 2rem; color: darkorange;"&gt;&lt;/i&gt;</code>
          <br>
          <i class="bi bi-cloud-sun" style="font-size: 2rem; color: gold;"></i>
          <code>&lt;i class="bi bi-cloud-sun" style="font-size: 2rem; color: gold;"&gt;&lt;/i&gt;</code>
          <br>
          <i class="bi bi-emoji-smile" style="font-size: 2rem; color: green;"></i>
          <code>&lt;i class="bi bi-emoji-smile" style="font-size: 2rem; color: green;"&gt;&lt;/i&gt;</code>
          <p>Puedes encontrar la lista completa de iconos en <a href="https://icons.getbootstrap.com/">su web oficial.</a></p>
        </div>
      </div>
 
      <div class="col-md-6 sass-example">
        <h1>SASS</h1>
        <p>SASS (Syntactically Awesome Stylesheets) es un preprocesador de CSS que permite escribir hojas de estilo de una manera más eficiente y organizada.</p>
        <p class="psass">
          SASS es un preprocesador CSS que agrega características como:
          <ul>
            <li>Anidación de estilos</li>
            <li>Variables</li>
            <li>Mixins</li>
            <li>Herencia</li>
          </ul>
          Todo esto mejora la mantenibilidad del código CSS.
        </p>
      </div>
    </div>
  </div>
 </template>
 
 <script setup>
 import { useRouter } from 'vue-router';
 import SearchBar from '@/components/SearchBar.vue';
 import SongCarousel from '@/components/SongCarousel.vue';
 
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