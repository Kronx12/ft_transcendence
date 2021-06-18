import { createStore } from "vuex";

const axios = require('axios');

const instance = axios.create({
  baseURL: 'http://localhost:3000/',
});

export default createStore({
  state: {
    status: '',
    user: {
      id: -1,
      login: '',
      avatarURL: '',
    }
  },
  mutations: {
    setStatus: function(state, status) {
      state.status = status;
    },
    logUser: function(state, user) {
      state.user = user;
      console.log(state.user)
    },
  },
  actions: {
    getToken: ({commit}, code) => {
      commit('setStatus', 'loading')
      return new Promise((resolve, reject) => {
        instance.get(`/login/${code}`)
        .then(function(response: any) {
          commit('setStatus', 'done')
          localStorage.setItem("ft_token", response.data.token)
          console.log("token", localStorage.getItem("ft_token"));
         resolve(response);
        })
        .catch(function(error: any) {
          commit('setStatus', 'error')
          reject(error)
        });
    });
  },
  getLogin: ({commit}, token) => {
    
    commit('setStatus', 'loading')
    return new Promise((resolve, reject) => {
      instance.post(`/login/${token}`)
      .then(function(response: any) {
        commit('setStatus', 'logged')
        commit('logUser', {id: response.data.intra_id, login: response.data.login, avatarURL: 'https://cdn.intra.42.fr/users/small_' + response.data.login + '.jpg'})
        resolve(response.data)
      })
      .catch(function(error: any) {
        commit('setStatus', 'invalid_token')
        console.log(error)
        reject(error)
    });
  });
  }
},
  modules: {},
});
