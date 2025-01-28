<template>
  <div class="modal-overlay" v-if="showModal">
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
</template>

<script setup>
import { ref, onMounted } from 'vue';

const showModal = ref(true);
const userName = ref('');
const selectedAvatar = ref(1);

const avatars = [
  { id: 1, name: 'Avatar 1', url: '/api/placeholder/50/50' },
  { id: 2, name: 'Avatar 2', url: '/api/placeholder/50/50' },
  { id: 3, name: 'Avatar 3', url: '/api/placeholder/50/50' },
  { id: 4, name: 'Avatar 4', url: '/api/placeholder/50/50' }
];

const selectAvatar = (id) => {
  selectedAvatar.value = id;
};

onMounted(() => {
  // Comprobar si ya existe un usuario
  const existingUser = localStorage.getItem('user');
  if (existingUser) {
    showModal.value = false;
  }
});

const saveUser = () => {
  if (userName.value.trim()) {
    localStorage.setItem('user', JSON.stringify({
      name: userName.value,
      avatarId: selectedAvatar.value
    }));
    showModal.value = false;
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-wrapper {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-content {
  text-align: center;
}

.modal-content h2 {
  color: #333;
  margin-bottom: 2rem;
}

.input-group {
  margin-bottom: 2rem;
  text-align: left;
}

.input-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #666;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #E1DDE4;
  border-radius: 8px;
  font-size: 1rem;
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
  border-color: #007bff;
  background: #f0f7ff;
}

.start-button {
  background: #007bff;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.start-button:hover {
  background: #0056b3;
}

.start-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>