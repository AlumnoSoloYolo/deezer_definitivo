
<template>
  <div class="modal-container" v-if="showModal">
    <header class="header-container">
      <div class="logo-section">
        <img src="/src/assets/img/deezerModal.png" alt="Deezer Logo" class="logo">
      </div>

      <nav class="nav-menu">
        <button
          v-for="item in navItems"
          :key="item"
          @click="setActiveItem(item)"
          :class="['nav-item', { active: activeItem === item }]"
        >
          {{ item }}
        </button>
      </nav>

      <div class="account-buttons">
        <button class="account-btn">
          Mi Cuenta
        </button>
        <button class="account-btn">
          Desconectarse
        </button>
      </div>
      
      <div class="mobile-menu-toggle" @click="toggleMobileMenu">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </header>

    <AnimatedMountains />
    <div class="modal-overlay">
      <div class="modal-wrapper">
        <div class="modal-content">
          <h2>Bienvenido a Deezer Music Client</h2>
          <div class="input-group">
            <label for="userName">¿Cómo te llamas?</label>
            <input
              id="userName"
              v-model="userName"
              placeholder="Tu nombre"
              type="text"
              @keyup.enter="saveUser"
            />
          </div>
          <div class="avatar-selection">
            <h3>Elige tu avatar</h3>
            <div class="avatar-grid">
              <div
                v-for="avatar in avatars"
                :key="avatar.id"
                :class="['avatar-option', { selected: selectedAvatar === avatar.id }]"
                @click="selectAvatar(avatar.id)"
              >
                <img :src="avatar.url" :alt="avatar.name">
              </div>
            </div>
          </div>
          <button
            @click="saveUser"
            :disabled="!userName.trim()"
            class="start-button"
          >
            Comenzar
          </button>
        </div>
      </div>
    </div>

   
    <div :class="['mobile-menu', { 'is-active': isMobileMenuOpen }]">
      <button
        v-for="item in navItems"
        :key="item"
        @click="handleMobileNavClick(item)"
        :class="['mobile-nav-item', { active: activeItem === item }]"
      >
        {{ item }}
      </button>
      <div class="mobile-account-buttons">
        <button class="account-btn">Mi Cuenta</button>
        <button class="account-btn">Desconectarse</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import AnimatedMountains from './AnimatedMountains.vue';

const showModal = ref(true);
const userName = ref('');
const selectedAvatar = ref(1);
const isMobileMenuOpen = ref(false);

const activeItem = ref('Música');
const navItems = ['Ofertas', 'Características', 'Música'];

const setActiveItem = (item) => {
  activeItem.value = item;
};

const avatars = [
  { id: 1, name: 'Avatar 1', url: '/src/assets/img/avatar1.gif' },
  { id: 2, name: 'Avatar 2', url: '/src/assets/img/avatar2.gif' },
  { id: 3, name: 'Avatar 3', url: '/src/assets/img/avatar3.gif' },
  { id: 4, name: 'Avatar 4', url: '/src/assets/img/avatar4.gif' },
  { id: 5, name: 'Avatar 5', url: '/src/assets/img/avatar5.gif' },
  { id: 6, name: 'Avatar 6', url: '/src/assets/img/avatar6.gif' },
  { id: 7, name: 'Avatar 7', url: '/src/assets/img/avatar7.gif' },
  { id: 8, name: 'Avatar 8', url: '/src/assets/img/avatar8.gif' },
];

const selectAvatar = (id) => {
  selectedAvatar.value = id;
};

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const handleMobileNavClick = (item) => {
  setActiveItem(item);
  isMobileMenuOpen.value = false;
};

onMounted(() => {

  // Verificamos si ya existe un usuario en localStorage y tiene una marca de primera vez
  const existingUser = localStorage.getItem('user');
  const firstTimeUser = localStorage.getItem('firstTimeUser');
  
  if (existingUser && firstTimeUser === 'false') {
    showModal.value = false;
  }
});

const saveUser = () => {
  if (userName.value.trim()) {
    const userData = {
      name: userName.value,
      avatarId: selectedAvatar.value
    }
    
    // Guardamos datos de usuario
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Marcamos que ya no es la primera vez
    localStorage.setItem('firstTimeUser', 'false');
    
    // Recargamos la página
    window.location.reload();
  }
}
</script>

<style lang="scss" scoped>

.header-container {
  background: #0F0D13;
  width: 100%;
  height: 80px;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1001;
  border-bottom: 1px solid #555257;
}

.logo-section {
  display: flex;
  align-items: center;
}

.logo {
  width: 110px;
  padding: 0;
  margin: 0;
  margin-left: 100px;
}

.nav-menu {
  margin-left: 500px;
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-item {
  color: white;
  font-size: 1.125rem;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: color 0.2s;
}

.nav-item:hover {
  color: #A238FF;
}

.nav-item.active {
  color: #A238FF;
}

.account-buttons {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.account-btn {
  padding: 0.5rem 1rem;
  color: white;
  background: transparent;
  border: 2px solid white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
}

.account-btn:hover {
  background: white;
  color: black;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
}

.modal-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  width: 100%;
  height: 100%;
}

.modal-wrapper {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  position: relative;
  margin-top: 100px;
  z-index: 5;
}

.modal-content {
  text-align: center;
}

.modal-content h2 {
  color: #333;
  margin-bottom: 2rem;
  font-size: 1.8rem;
}

.input-group {
  margin-bottom: 2rem;
  text-align: left;
}

.input-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #666;
  font-size: 1rem;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #E1DDE4;
  border-radius: 8px;
  font-size: 1rem;
}

input:focus {
  border-color: #A238FF;
  outline: none;
}

.avatar-selection {
  margin: 2rem 0;
}

.avatar-selection h3 {
  color: #666;
  margin-bottom: 1rem;
}

.avatar-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin: 1rem 0;
}

.avatar-option {
  padding: 0.5rem;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.avatar-option img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}

.avatar-option.selected {
  border-color: #A238FF;
  background: #f8f0ff;
}

.avatar-option:hover {
  transform: scale(1.05);
}

.start-button {
  background: #A238FF;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  max-width: 200px;
}

.start-button:hover:not(:disabled) {
  background: #8929e0;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(162, 56, 255, 0.3);
}

.start-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* Menú móvil hamburguesa */
.mobile-menu-toggle {
  display: none;
  flex-direction: column;
  cursor: pointer;
}

.mobile-menu-toggle span {
  width: 25px;
  height: 3px;
  background-color: white;
  margin: 3px 0;
  transition: 0.4s;
}

.mobile-menu {
  display: none;
}

/* Estilos Responsivos */
@media screen and (max-width: 1200px) {
  .nav-menu {
    margin-left: 200px;
  }
}

@media screen and (max-width: 992px) {
  .header-container {
    padding: 1rem;
  }

  .nav-menu,
  .account-buttons {
    display: none;
  }

  .mobile-menu-toggle {
    display: flex;
  }

  .mobile-menu {
    position: fixed;
    top: 70px;
    left: 0;
    right: 0;
    background: #0F0D13;
    display: flex;
    flex-direction: column;
    align-items: center;
    transform: translateY(-150%);
    transition: transform 0.3s ease-in-out;
    z-index: 1000;
    padding: 1rem;
    border-bottom: 1px solid #555257;
  }

  .mobile-menu.is-active {
    transform: translateY(0);
  }

  .mobile-nav-item {
    color: white;
    padding: 1rem;
    width: 100%;
    text-align: center;
    border-bottom: 1px solid #333;
  }

  .mobile-nav-item.active {
    color: #A238FF;
  }

  .mobile-account-buttons {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
  }
}

@media screen and (max-width: 768px) {
  .modal-wrapper {
    width: 95%;
    padding: 1rem;
  }

  .modal-content h2 {
    font-size: 1.5rem;
  }

  .avatar-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .avatar-option img {
    width: 40px;
    height: 40px;
  }
}

@media screen and (max-width: 480px) {
  .header-container {
    padding: 0.5rem;
  }

  .logo {
    height: 30px;
  }

  .avatar-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .start-button {
    max-width: 100%;
  }
}
</style>