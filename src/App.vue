<template>
  <div id="app-contenido">
    <WelcomeModal v-if="!user" @userSaved="handleUserSaved" />
    
    <aside class="sidebar" :class="{ 'collapsed': isCollapsed }">
      <div class="sidebar-content">
        <img class="logo" :src="currentLogo" alt="Deezer Logo">
        
        <Menu :is-collapsed="isCollapsed" />

        <div class="subscribe-banner" :class="{ 'collapsed': isCollapsed }">
          <div v-if="!isCollapsed">
            <span>Suscríbete y sáltate gratis los anuncios durante 1 mes.</span>
            <button><a  href="https://www.deezer.com/es/offers?origin=CONVERSION_BANNER">Probar ahora</a></button>
          </div>
          <i v-else class="bi bi-gem"></i>
        </div>

        <PlaylistMenu :is-collapsed="isCollapsed" :user="user" />

  
      </div>
    </aside>

    <div class="main-wrapper">
      <main class="main-content">
        <RouterView />
      </main>
    </div>

    <MusicPlayer ref="player" />
  </div>
</template>
<script setup>
import { RouterView, useRoute } from 'vue-router'
import { ref, onMounted, computed } from 'vue'
import Menu from "./components/menu.vue"
import PlaylistMenu from './components/playlistMenu.vue'
import WelcomeModal from './components/WelcomeModal.vue'
import MusicPlayer from './components/MusicPlayer.vue'
import deezerLogo from '@/assets/img/deezer.png'
import deezerIcon from '@/assets/img/corazonDeezer.png' 

const user = ref(null)
const isCollapsed = ref(false)
const route = useRoute()

const currentLogo = computed(() => {
  return isCollapsed.value ? deezerIcon : deezerLogo
})


const handleResize = () => {
  isCollapsed.value = window.innerWidth < 768
}

const handleUserSaved = (userData) => {
  user.value = userData
}


onMounted(() => {
  // Cargar usuario del localStorage al iniciar
  const savedUser = localStorage.getItem('user')
  if (savedUser) {
    try {
      user.value = JSON.parse(savedUser)
    } catch (error) {
      console.error('Error al parsear los datos del usuario:', error)
    }
  }

  // Configuración del responsive
  handleResize()
  window.addEventListener('resize', handleResize)
})

</script>


<style lang="scss">
$sidebar-width: 270px;
$sidebar-collapsed-width: 70px;
$primary-color: #A238FF;
$transition-speed: 0.3s;
$icon-size: 40px;

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap');
* {
  font-family: "Inter", "Arial", sans-serif;
}

body, html {
  font-family: "Inter", "Arial", sans-serif;
}

#app-contenido {
  position: relative;
  display: flex;
  min-height: 100vh;
}

#app-contenido {
  position: relative;
  display: flex;
  min-height: 100vh;
}

.sidebar {
  background-color: #F5F2F8;
  width: $sidebar-width;
  transition: width $transition-speed ease;
  border-right: 2px solid #E1DDE4;
  padding-top: 5px;
  position: sticky;
  top: 0;
  height: calc(100vh - 80px);
  overflow-y: auto;
  
  &.collapsed {
    width: $sidebar-collapsed-width;
    
    .logo {
     
      width: 60px;
      margin-top: 5px;
      margin-left: 6px;
      margin-bottom: 10px;
    }
  }
}

.main-wrapper {
  flex: 1;
  height: calc(100vh - 80px);
  overflow-y: auto;
}


.logo {
  margin-top: 10px;
  width: 180px;
  padding: 0 0.5rem;
  margin-bottom: 25px;;
  transition: all $transition-speed ease;
}

.subscribe-banner {
  width: 90%;
  margin-left: 0.7rem;
  background-color: $primary-color;
  color: white;
  padding: 16px;
  border-radius: 5px;
  transition: all $transition-speed ease;

  a{
    text-decoration: none;
    color: white
  }
  ;
  
  &.collapsed {
    width: $icon-size;
    height: $icon-size;
    padding: 0;
    margin: 0.5rem auto;
    display: flex;
    justify-content: center;
    align-items: center;
    
    .bi-gem {
      font-size: 1.5rem;
      color: white;
    }
  }
  
  button {
    background-color: #471970;
    color: white;
    margin-top: 0.5rem;
    padding: 0.15rem 1rem;
    border: 2px solid white;
    border-radius: 10px;
    cursor: pointer;
    
    &:hover {
      opacity: 0.9;
    }
  }
}

.user-profile {
  margin-top: auto;
  display: flex;
  align-items: center;
  padding: 1rem;
  
  .user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    margin-right: 1rem;
  }
}

.main-content {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .sidebar {
    width: $sidebar-collapsed-width;
  }
}
</style>