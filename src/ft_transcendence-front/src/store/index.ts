import { createStore } from "vuex";

const axios = require('axios');

const instance = axios.create({
  baseURL: 'http://localhost:3000/',
});
const jwt = require('jsonwebtoken');

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
    waitIntra: ({commit}) => {
      commit('setStatus', 'loading')
    },
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
        
        instance.get(`/database/user/${response.data.intra_id}`)
        .then(function(user: any) {
          if(!user.data.id)
          {
            instance.post(`/database/user`, {
              intra_id: response.data.intra_id, 
              username: response.data.login,
              avatar: 'https://cdn.intra.42.fr/users/small_' + response.data.login + '.jpg',
              status: 1
            }).then(function(created: any) {
              const token = jwt.sign({id: created.data.intra_id, login: created.data.username, avatarURL: created.data.avatar}, 'shhhhh',{ expiresIn: '1h' });
              localStorage.setItem("jwtToken", token);
              commit('setStatus', 'logged')
              commit('logUser', {id: created.data.intra_id, login: created.data.username, avatarURL: created.data.avatar})
              resolve(created.data)
            })
          }
          else
          {
            const token = jwt.sign({id: user.data.intra_id, login: user.data.username, avatarURL: user.data.avatar}, 'shhhhh',{ expiresIn: '1h' });
            localStorage.setItem("jwtToken", token);
            commit('setStatus', 'logged')
            commit('logUser', {id: user.data.intra_id, login: user.data.username, avatarURL: user.data.avatar})
            resolve(user.data)
          }
        })
        resolve(response.data)
      })
      .catch(function(error: any) {
        commit('setStatus', 'invalid_token')
        console.log(error)
        reject(error)
    });
  });
  },
  editUsername: ({commit}, params) => {
    instance.patch(`/database/user/${params.id}`, {username: params.username});
  },
  editAvatar: ({commit}, params) => {
    instance.patch(`/database/user/${params.id}`, {avatar: params.avatar});
  },
},
  modules: {},
});
