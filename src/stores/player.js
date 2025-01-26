import { defineStore } from 'pinia'

export const usePlayerStore = defineStore('player', {
    state: () => ({
        currentSong: null,
        isPlaying: false,
        queue: [],
        playbackError: null
    }),
    actions: {
        // Método para establecer la cola de reproducción
        setQueue(songs) {
            this.queue = songs

            // Establecer la primera canción si la cola no está vacía
            if (songs.length > 0 && !this.currentSong) {
                this.setCurrentSong(songs[0])
            }
        },

        playSong(song) {
            // Intentar reproducir el preview original
            if (this.isValidPreview(song.preview)) {
                this.setCurrentSong(song)
                return
            }

            // Intentar reproducir un preview alternativo
            const alternativePreview = this.getAlternativePreview(song)

            if (alternativePreview) {
                const songWithAlternative = {
                    ...song,
                    preview: alternativePreview
                }
                this.setCurrentSong(songWithAlternative)
            } else {
                this.playbackError = 'No se puede reproducir la vista previa'
                console.error('Error de reproducción:', this.playbackError)
            }
        },

        isValidPreview(url) {
            return url &&
                typeof url === 'string' &&
                url.startsWith('http') &&
                url.includes('preview')
        },

        getAlternativePreview(song) {
            // Estrategias alternativas para obtener preview
            const strategies = [
                // Reemplazar parte de la URL
                () => song.preview?.replace('https://cdnt-preview', 'https://preview'),
                // Usar un proxy genérico (opcional y no siempre funciona)
                () => `https://corsproxy.io/?${encodeURIComponent(song.preview)}`,
                // Si todo falla, devolver null
                () => null
            ]

            for (let strategy of strategies) {
                const alternativeUrl = strategy()
                if (this.isValidPreview(alternativeUrl)) {
                    return alternativeUrl
                }
            }

            return null
        },

        setCurrentSong(song) {
            if (!song) {
                this.playbackError = 'No se proporcionó una canción'
                return
            }

            this.currentSong = song
            this.isPlaying = true
            this.playbackError = null
        },

        clearPlaybackError() {
            this.playbackError = null
        },

        togglePlay() {
            this.isPlaying = !this.isPlaying
        },

        addToQueue(song) {
            if (!this.queue.some(s => s.id === song.id)) {
                this.queue.push(song)
            }
        },

        removeFromQueue(songId) {
            this.queue = this.queue.filter(song => song.id !== songId)

            if (this.currentSong?.id === songId) {
                this.nextSong()
            }
        },

        nextSong() {
            if (this.queue.length === 0) return

            const currentIndex = this.queue.findIndex(
                song => song.id === this.currentSong?.id
            )

            const nextIndex = currentIndex < this.queue.length - 1
                ? currentIndex + 1
                : 0

            this.setCurrentSong(this.queue[nextIndex])
        },

        previousSong() {
            if (this.queue.length === 0) return

            const currentIndex = this.queue.findIndex(
                song => song.id === this.currentSong?.id
            )

            const prevIndex = currentIndex > 0
                ? currentIndex - 1
                : this.queue.length - 1

            this.setCurrentSong(this.queue[prevIndex])
        }
    }
})