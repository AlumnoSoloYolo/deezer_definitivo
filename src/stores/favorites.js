// stores/favorites.js
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useFavoritesStore = defineStore('favorites', () => {
  // Estado
  const playlist = ref([])

  // Inicializar store con localStorage
  const loadFromStorage = () => {
    const savedPlaylist = localStorage.getItem('favorites')
    if (savedPlaylist) {
      playlist.value = JSON.parse(savedPlaylist)
    }
  }

  // Guardar en localStorage
  const saveToStorage = () => {
    localStorage.setItem('favorites', JSON.stringify(playlist.value))
  }

  // Añadir canción
  const addSong = (song) => {
    if (!playlist.value.some(s => s.id === song.id)) {
      playlist.value = [...playlist.value, song]
      saveToStorage()
    }
  }

  // Eliminar canción
  const removeSong = (songId) => {
    playlist.value = playlist.value.filter(song => song.id !== songId)
    saveToStorage()
  }

  // Verificar si es favorito
  const isFavorite = (songId) => {
    return playlist.value.some(song => song.id === songId)
  }

  // Actualizar orden de la playlist
  const updatePlaylistOrder = (newOrder) => {
    console.log('Updating playlist order with:', newOrder) // Debug
    playlist.value = [...newOrder]
    saveToStorage()
  }

  // Observar cambios
  watch(playlist, () => {
    saveToStorage()
  }, { deep: true })

  // Cargar datos al iniciar
  loadFromStorage()

  return {
    playlist,
    addSong,
    removeSong,
    isFavorite,
    updatePlaylistOrder
  }
})