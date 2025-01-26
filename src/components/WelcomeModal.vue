<template>
  <div class="modal" v-if="showModal">
    <div class="modal-content">
      <h2>Bienvenido a Deezer Music Client</h2>
      <input 
        v-model="userName" 
        placeholder="Tu nombre"
        type="text"
      />
      <div class="avatar-selection">
        <!-- Aquí agregaríamos avatares para seleccionar -->
      </div>
      <button @click="saveUser">Comenzar</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const showModal = ref(true);
const userName = ref('');

const saveUser = () => {
  if (userName.value) {
    localStorage.setItem('user', JSON.stringify({
      name: userName.value,
      avatar: 'default.png'
    }));
    showModal.value = false;
  }
}
</script>