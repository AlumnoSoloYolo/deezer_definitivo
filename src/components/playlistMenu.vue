<template>
    <h2 id="playlist-title">Playlist</h2>

    <ul id="playlist-menu">
        <li>
              <router-link class="nav-link" to="/playlists"><i class="bi bi-suit-heart-fill"></i><p>Canciones favoritas</p></router-link>
        </li>
        <li>
            <router-link class="nav-link" to="/playlists"><i class="bi bi-plus-lg"></i><p>Crear una playlist</p></router-link>
        </li>
    </ul>


</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

<style lang="scss">


#playlist-title{
  border-top: 1px solid #E1DDE4;
  margin-top: 145px;
  padding: 0.5rem;
  font-size: 1.2rem;
  font-weight: bold;
}


#playlist-menu{
    list-style: none;
    margin: 0;
    padding: 1.2rem;
    margin-bottom: 250px;


    li{
        display: flex;
        align-items: center;
        padding: 0 0.5rem;
        border-radius: 10px;

        $hover-bg-color: #EBE7EE;

    &:hover {
    background-color: $hover-bg-color;
    font-weight: bold;
    }
    }




    .nav-link{
        display: flex;
        flex-direction: row;
        align-items: center;


    .bi-suit-heart-fill{
    display: flex;
    width:3rem;
    height: 3rem;;
    background-color: #FFD0C3;
    color: #E85E38;
    justify-content: center;
    align-items: center;
    font-size: 1.5rem;
    }

    .bi-plus-lg{
        display: flex;
    width:3rem;
    height: 3rem;;
    color: #A9A5AC;
    justify-content: center;
    align-items: center;
    font-size: 2rem; 
    font-weight: bolder;
    }

    p{
        display: flex;
        align-items: center;
        height: 3rem;
        justify-content: center;
        margin-left: 0.5rem;
        text-align: center;
    }


    }


    
}





</style>



