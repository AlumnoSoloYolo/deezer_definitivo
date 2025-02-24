import { defineStore } from 'pinia'

export const usePlayerStore = defineStore('player', {
    state: () => ({
        currentSong: null,
        isPlaying: false,
        queue: [],
        playbackError: null
    }),
    actions: {
        // Establecer cola completa
        setQueue(songs) {
            this.queue = songs

            if (songs.length > 0 && !this.currentSong) {
                this.setCurrentSong(songs[0])
            }
        },

        // Reproducir una canción específica sin modificar la cola
        playSong(song) {
            // Si la canción no está en la cola, la añadimos
            if (!this.queue.some(s => s.id === song.id)) {
                this.queue.push(song)
            }

            if (this.isValidPreview(song.preview)) {
                this.setCurrentSong(song)
                return
            }

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
            const strategies = [
                () => song.preview?.replace('https://cdnt-preview', 'https://preview'),
                () => `https://corsproxy.io/?${encodeURIComponent(song.preview)}`,
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

            // Navegación circular usando el operador módulo
            const nextIndex = (currentIndex + 1) % this.queue.length
            this.setCurrentSong(this.queue[nextIndex])
        },

        previousSong() {
            if (this.queue.length === 0) return

            const currentIndex = this.queue.findIndex(
                song => song.id === this.currentSong?.id
            )

            // Navegación circular hacia atrás
            const previousIndex = (currentIndex - 1 + this.queue.length) % this.queue.length
            this.setCurrentSong(this.queue[previousIndex])
        }
    }
})