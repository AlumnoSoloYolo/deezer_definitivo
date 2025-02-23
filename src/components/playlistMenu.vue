<!-- PlaylistMenu.vue -->
<template>
  <div class="playlist-section">
    <h2 class="playlist-title">
      <span class="title-text" v-if="!isCollapsed">Playlist</span>
    </h2>

    <ul class="playlist-menu">
      <li 
        v-for="item in menuItems" 
        :key="item.to" 
        :class="{ 'collapsed': isCollapsed }"
      >
        <router-link class="nav-link" :to="item.to">
          <div :class="['icon-container', item.iconClass]">
            <i :class="item.icon"></i>
          </div>
          <span v-if="!isCollapsed" class="nav-text">{{ item.text }}</span>
        </router-link>
      </li>
    </ul>
  </div>

  <!-- Avatar y nombre de usuario si están disponibles -->
  <div v-if="user" class="user-profile" :class="{ 'collapsed': isCollapsed }">
    <div class="avatar-container" @click="showLogoutModal = true">
      <img 
        :src="getAvatarUrl(user.avatarId)" 
        :alt="`Avatar de ${user.name}`" 
        class="user-avatar"
      >
      <span v-if="!isCollapsed" class="user-name">{{ user.name }}</span>
    </div>
    
  </div>

  <!-- Modal usando Teleport para asegurar que esté en el nivel superior -->
  <Teleport to="body">
    <div v-if="showLogoutModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Perfil de Usuario</h3>
          <button class="close-btn" @click="closeModal">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="user-info">
            <img 
              :src="getAvatarUrl(user.avatarId)" 
              :alt="`Avatar de ${user.name}`" 
              class="modal-avatar"
            >
            <h4>{{ user.name }}</h4>
          </div>
        </div>

        <div class="modal-footer">
          <button class="logout-btn" @click="handleLogout">
            <i class="bi bi-box-arrow-right"></i>
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { RouterLink, useRouter } from 'vue-router'
import { ref, onMounted, onUnmounted } from 'vue'

const router = useRouter()
const showLogoutModal = ref(false)
const user = ref(null)

const props = defineProps({
  isCollapsed: {
    type: Boolean,
    default: false
  },
  user: {
    type: Object,
    default: null
  }
})

const menuItems = [
  {
    to: '/playlists',
    text: 'Canciones favoritas',
    icon: 'bi bi-suit-heart-fill',
    iconClass: 'heart'
  },
  {
    to: '/playlists/create',
    text: 'Crear una playlist',
    icon: 'bi bi-plus-lg',
    iconClass: 'plus'
  }
]


// Función para obtener la ruta del avatar
const getAvatarUrl = (avatarId) => `/src/assets/img/avatar${avatarId}.gif`

// Funciones del modal
const closeModal = () => {
  showLogoutModal.value = false
}

const handleLogout = () => {
  localStorage.removeItem('user')
  showLogoutModal.value = false
  router.push('/')
  window.location.reload()
}

const handleEscape = (e) => {
  if (e.key === 'Escape' && showLogoutModal.value) {
    closeModal()
  }
}

onMounted(() => {
  // Cargamos datos del usuario
  const storedUser = localStorage.getItem('user')
  if (storedUser) {
    try {
      user.value = JSON.parse(storedUser)
    } catch (error) {
      console.error('Error al parsear los datos del usuario:', error)
    }
  }
  
  // Añadimos event listener para Escape
  window.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleEscape)
})
</script>

<style lang="scss" scoped>
$hover-bg-color: #EBE7EE;
$icon-size: 40px;
$primary-color: #A238FF;

.playlist-section {
  margin-top: 1rem;
  border-top: 1px solid #E1DDE4;
}

.playlist-title {
  padding: 1rem 0.5rem;
  font-size: 1.2rem;
  font-weight: bold;
}

.playlist-menu {
  list-style: none;
  padding: 0 1rem;
  margin: 0;

  li {
    border-radius: 10px;
    transition: all 0.3s ease;

    &:hover {
      background-color: $hover-bg-color;
    }

    &.collapsed {
      width: $icon-size;
      height: $icon-size;

      .nav-link {
        padding: 0;
      }

      .icon-container {
        width: 100%;
        height: 100%;
      }
    }
  }
}

.nav-link {
  display: flex;
  text-decoration: none;
  color: inherit;
  gap: 1rem;
  padding: 0.5rem 0;
}

.icon-container {
  display: flex;
  width: $icon-size;
  height: $icon-size;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;
  border-radius: 5px;

  &.heart {
    background-color: #FFD0C3;
    i {

      color: #E85E38;
      font-size: 1.7rem;
    }
  }

  &.plus {
    i {
      color: #A9A5AC;
      font-size: 2rem;
      font-weight: bolder;
    }
  }
}

.user-profile {
  width: 100%;
  transition: all 0.3s ease;

  &.collapsed {
    justify-content: center;
  }
}
.avatar-container {
  display: flex; // Añadir display flex
  align-items: center; // Centrar verticalmente
  gap: 1rem; // Espacio entre avatar y nombre
  cursor: pointer;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.05);
  }

  .user-avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    object-fit: cover;
    margin: 0;
  }

  .user-name {
    font-weight: bold;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}


// Estilos del Modal
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-content {
  position: relative;
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 10000;
  animation: modalAppear 0.3s ease;
}

@keyframes modalAppear {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-header {
  padding: 1rem;
  border-bottom: 1px solid #E1DDE4;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    margin: 0;
    font-size: 1.2rem;
    color: #333;
  }

  .close-btn {
    background: none;
    border: none;
    color: #666;
    cursor: pointer;
    font-size: 1.2rem;
    padding: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      color: $primary-color;
    }
  }
}

.modal-body {
  padding: 2rem;

  .user-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;

    .modal-avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      border: 3px solid $primary-color;
      object-fit: cover;
    }

    h4 {
      margin: 0;
      font-size: 1.3rem;
      color: #333;
    }
  }
}

.modal-footer {
  padding: 1rem;
  border-top: 1px solid #E1DDE4;
  display: flex;
  justify-content: center;

  .logout-btn {
    background-color: #dc3545;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: background-color 0.2s;

    &:hover {
      background-color: #ce2b3b;
    }

    i {
      font-size: 1.2rem;
    }
  }
}

// Media queries
@media (max-width: 768px) {
  .nav-text {
    display: none;
  }
  
  .playlist-menu li {
    width: $icon-size;
    height: $icon-size;
    
    .nav-link {
      padding: 0;
      justify-content: center;
    }

    .icon-container {
      width: 100%;
      height: 100%;
    }
  }
}
</style>