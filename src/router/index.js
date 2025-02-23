import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue';
import PlaylistsView from '../views/PlaylistsView.vue';
import SearchView from '../views/SearchView.vue';
import InfoPlaylist from '@/components/InfoPlaylist.vue';
import InfoAlbum from '@/components/InfoAlbum.vue';
import InfoArtist from '@/components/InfoArtist.vue';
import InfoSong from '@/components/InfoSong.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
  },
  {
    path: '/playlists',
    name: 'Playlists',
    component: PlaylistsView,
  },
  {
    path: '/search',
    name: 'Buscador',
    component: SearchView,
  },
  {
    path: '/info/:type/:id',
    name: 'Info',
    component: () => import('../views/InfoView.vue')
  },
  {
    path: '/playlist/:id',
    name: 'playlist-info',
    component: InfoPlaylist
  },
  {
    path: '/album/:id',
    name: 'album-info',
    component: InfoAlbum
  },
  {
    path: '/artist/:id',
    name: 'artist-info',
    component: InfoArtist
  },
  {
    path: '/song/:id',
    name: 'song-info',
    component: InfoSong
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router