import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue';
import PlaylistsView from '../views/PlaylistsView.vue';
import SearchView from '../views/SearchView.vue';

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
    path: '/album/:id',
    component: () => import('@/components/InfoAlbum.vue'),
    children: [
      {
        path: 'track/:trackId',
        component: () => import('@/components/InfoSong.vue'),
      },
      {
        path: 'artist/:artistId',
        component: () => import('@/components/InfoArtist.vue'),
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router