<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { ref, onMounted } from 'vue';
import Menu from "./components/menu.vue";
import playlistMenu from './components/playlistMenu.vue';
import WelcomeModal from './components/WelcomeModal.vue';
import MusicPlayer from './components/MusicPlayer.vue';
import deezerLogo from '@/assets/img/Deezer_logo,_2023.svg.png';

const user = ref(null);

onMounted(() => {
 const savedUser = localStorage.getItem('user');
 if (savedUser) {
   user.value = JSON.parse(savedUser);
 }
});
</script>

<template>
 <div id="app-contenido">
   <WelcomeModal v-if="!user" />
   
  <aside class="h-screen py-3">
      <div>
        <img class="logo" :src="deezerLogo" alt="">
        
        <!-- Menu -->
        <Menu />

        <span class="suscribe">Suscríbete y sáltate gratis los anuncios durante 1 mes.
            <button> Probar ahora</button>
        </span>

        <playlistMenu />

        
        <!-- User section -->
        <div v-if="user" class="mt-auto flex items-center">
          <img :src="user.avatar" class="rounded-full mr-2" width="40" height="40" />
          <span>{{ user.name }}</span>
        </div>
      </div>
  </aside>

 <!-- Main Content -->
 <main class="container my-4 p-0">
     <router-view />
   </main>

   <MusicPlayer ref="player" /> 

</div>


  
</template>

<style lang="scss">


aside{
  background-color: #F5F2F8;
  width: 25%;
  border-right:2px solid #E1DDE4;
}

.logo{
  display: block;
  width: 200px;
  padding: 0 1rem;
  margin: 0;
}

#app-contenido{
  display: flex;
}


.fixed-bottom {
 position: fixed;
 bottom: 0;
 width: 100%;
 z-index: 1000;
}

</style>