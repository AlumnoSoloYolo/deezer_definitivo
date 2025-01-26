<template>
    <nav class="navbar navbar-expand-lg">
          <ul class="menu">
            <li class="nav-item">
              <router-link class="nav-link" to="/"><i class="bi bi-house-door"></i> Home</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/search"><i class="bi bi-compass"></i>Explorar</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/playlists"><i class="bi bi-suit-heart"></i>Favoritos</router-link>
            </li>
          </ul>
    </nav>
</template>
<script setup>
import { RouterLink } from 'vue-router'
</script>

<style lang="scss">

$hover-bg-color: #EBE7EE;
$hover-text-color: #A238FF;
.menu {
  position: relative;
  display: flex;
  flex-direction: column;
  list-style: none;
  margin-left: 0;
  width: 100%;
  padding: 1rem;
}

.nav-item {
  width: 100%;
  padding: 0.3rem;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
  font-size: 1.1rem;
  font-weight: bold;
  border-radius: 10px;
  .nav-link {
    display: flex;
    align-items: center;
    gap: 1rem;
    
    i {
      font-size: 1.4rem;
    }
  }

  &:hover {
    background-color: $hover-bg-color;
    color: $hover-text-color;
    font-weight: bold;
  }
}

.suscribe{
  display: block;
  width: 251px;
  height: 120px;
  background-color: $hover-text-color;
  color: white;
  padding: 16px;
  border-radius: 5px;
  margin-left: 0.5rem;

  button{
    background-color: #471970;
    color: white;
    margin-top: 0.5rem;
    padding: 0.15rem 1rem;
    border: 2px solid white;
    border-radius: 10px;
  }
}

</style>
