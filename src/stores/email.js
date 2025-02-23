import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    email: '',
  }),
  getters: {

    emailDomain: (state) => state.email.split('@')[1] || '',
  },
  actions: {

    setEmail(newEmail) {
      this.email = newEmail;
    },

    clearEmail() {
      this.email = '';
    },
  },
});
