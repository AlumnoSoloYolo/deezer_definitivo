<!-- Menu.vue -->
<template>
  <nav class="navbar">

    <ul class="menu">
      <li class="nav-item" :class="{ 'active': isActive('/'), 'collapsed': isCollapsed }">
        <router-link class="nav-link" to="/">
          <div class="icon-container">
            <i class="bi bi-house-door"></i>
          </div>
          <span v-if="!isCollapsed" class="nav-text">Inicio</span>
        </router-link>
      </li>
      <li class="nav-item" :class="{ 'active': isActive('/search'), 'collapsed': isCollapsed }">
        <router-link class="nav-link" to="/search">
          <div class="icon-container">
            <i class="bi bi-compass"></i>
          </div>
          <span v-if="!isCollapsed" class="nav-text">Explorar</span>
        </router-link>
      </li>
      <li class="nav-item" :class="{ 'active': isActive('/playlists'), 'collapsed': isCollapsed }">
        <router-link class="nav-link" to="/playlists">
          <div class="icon-container">
            <i class="bi bi-suit-heart"></i>
          </div>
          <span v-if="!isCollapsed" class="nav-text">Favoritos</span>
        </router-link>
      </li>
    </ul>


  </nav>
</template>

<script setup>
import { RouterLink, useRoute } from 'vue-router'
import { ref, onMounted } from 'vue'

const props = defineProps({
  isCollapsed: {
    type: Boolean,
    default: false
  }
})

const route = useRoute()
const user = ref(null)



// Función para verificar si una ruta está activa
const isActive = (path) => {
  return route.path === path
}

// Al montar el componente, recuperar los datos del usuario de localStorage
onMounted(() => {
  const storedUser = localStorage.getItem('user')
  if (storedUser) {
    try {
      user.value = JSON.parse(storedUser)
    } catch (error) {
      console.error('Error al parsear los datos del usuario:', error)
    }
  }
})
</script>

<style lang="scss" scoped>
$hover-bg-color: #EBE7EE;
$hover-text-color: #A238FF;
$active-color: #A238FF;
$icon-size: 40px;

.menu {
  list-style: none;
  margin: 0;
  padding: 0 1rem;
  width: 100%;
}

.nav-item {
  margin: 0.2rem 0;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 10px;
  position: relative;

  &:hover {
    background-color: $hover-bg-color;
    color: $hover-text-color;
  }

  &.active {
    background-color: $hover-bg-color;
    color: $hover-text-color;
    font-weight: bold;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 70%;
      background-color: $active-color;
      border-radius: 0 3px 3px 0;
    }
  }

  .nav-text{
    color: black;
    font-weight: bold;
      
  }

  &.collapsed {
    width: $icon-size;
    height: $icon-size;
    margin: 0.5rem auto;
    
    .nav-link {
      padding: 0;
      justify-content: center;
    }

    .icon-container {
      width: 100%;
      height: 100%;
    }

    &.active::before {
      left: -3px;
    }
  }
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.2rem;
  text-decoration: none;
  color: inherit;
}

.icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: $icon-size;
  height: $icon-size;
  transition: all 0.3s ease;
  
  i {
    font-size: 1.4rem;
  }
}

@media (max-width: 768px) {
  .nav-text {
    display: none;
  
  }
  
  .nav-item {
    width: $icon-size;
    height: $icon-size;
    margin: 0.5rem auto;
    
    .nav-link {
      padding: 0;
      justify-content: center;
    }

    .icon-container {
      width: 100%;
      height: 100%;
    }

    &.active::before {
      left: -3px;
    }
  }
}
</style>