import { defineStore } from 'pinia';

export const useFavoritesStore = defineStore('favorites', {
  state: () => ({
    playlist: JSON.parse(localStorage.getItem('playlist')) || [],
  }),
  getters: {
    isFavorite: (state) => (id) => {
      return state.playlist.some((song) => song.id === id);
    },
  },
  actions: {
    addSong(song) {
      if (!this.isFavorite(song.id)) {
        this.playlist.push(song);
        this.saveToLocalStorage();
      }
    },
    removeSong(songId) {
      this.playlist = this.playlist.filter((song) => song.id !== songId);
      this.saveToLocalStorage();
    },
    saveToLocalStorage() {
      localStorage.setItem('playlist', JSON.stringify(this.playlist));
    }
  },
});