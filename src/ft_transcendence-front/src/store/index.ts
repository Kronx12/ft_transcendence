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
    },
    friends: {
      list: "",
      request: "",
      asked: "",
    },
  },
  mutations: {
    setStatus: function (state, status) {
      state.status = status;
    },
    logUser: function (state, user) {
      state.user = user;
      console.log(state.user)
    },
    updateFriend: function (state, list) {
      state.friends = list;
    },
  },
  actions: {
    waitIntra: ({ commit }) => {
      commit('setStatus', 'loading')
    },
    getToken: ({ commit }, code) => {
      commit('setStatus', 'loading')
      return new Promise((resolve, reject) => {
        instance.get(`/login/${code}`)
          .then(function (response: any) {
            commit('setStatus', 'done')
            localStorage.setItem("ft_token", response.data.token)
            console.log("token", localStorage.getItem("ft_token"));
            resolve(response);
          })
          .catch(function (error: any) {
            commit('setStatus', 'error')
            reject(error)
          });
      });
    },
    getUser: ({ commit }, id) => {
      return new Promise((resolve, reject) => {
        instance.get(`/database/user/${id}`).then(function (user: any) {
          console.log(user.data);
          resolve(user.data);
        });
      });
    },
    getLogin: ({ commit }, token) => {

      commit('setStatus', 'loading')
      return new Promise((resolve, reject) => {
        instance.post(`/login/${token}`)
          .then(function (response: any) {

            instance.get(`/database/user/${response.data.intra_id}`)
              .then(function (user: any) {
                if (!user.data.id) {
                  instance
                    .post(`/database/user`, {
                      intra_id: response.data.intra_id,
                      username: response.data.login,
                      avatar:
                        "https://cdn.intra.42.fr/users/small_" +
                        response.data.login +
                        ".jpg",
                      status: 1,
                      friends: "",
                      friends_request: "",
                      asked: ""
                    })
                    .then(function (created: any) {
                      const token = jwt.sign(
                        {
                          id: created.data.intra_id,
                          login: created.data.username,
                          avatarURL: created.data.avatar,
                        },
                        "shhhhh",
                        { expiresIn: "1h" }
                      );
                      localStorage.setItem("jwtToken", token);
                      commit("setStatus", "logged");
                      commit("logUser", {
                        id: created.data.intra_id,
                        login: created.data.username,
                        avatarURL: created.data.avatar,
                      });
                      resolve(created.data);
                    });
                }
                else {
                  const token = jwt.sign({ id: user.data.intra_id, login: user.data.username, avatarURL: user.data.avatar }, 'shhhhh', { expiresIn: '1h' });
                  localStorage.setItem("jwtToken", token);
                  commit('setStatus', 'logged')
                  commit('logUser', { id: user.data.intra_id, login: user.data.username, avatarURL: user.data.avatar })
                  instance.patch(`/database/user/${user.data.intra_id}`, { status: 1 });
                  resolve(user.data)
                }
              })
            resolve(response.data)
          })
          .catch(function (error: any) {
            commit('setStatus', 'invalid_token')
            console.log(error)
            reject(error)
          });
      });
    },
    editUsername: ({ commit }, params) => {
      instance.patch(`/database/user/${params.id}`, { username: params.username });
    },
    editAvatar: ({ commit }, params) => {
      instance.patch(`/database/user/${params.id}`, { avatar: params.avatar });
    },
    editStatus: ({ commit }, params) => {
      instance.patch(`/database/user/${params.id}`, { status: params.status });
    },
    searchUser: ({ commit }, name) => {
      return new Promise((resolve, reject) => {
        instance.get(`/database/user/search/${name}`)
          .then((result: any) => {

            const response = {
              type: '',
              data: result.data
            }

            if (result.data.id != undefined)
              response.type = 'unique';
            else
              response.type = 'multiple';
            resolve(response);
          })
      })
    },
    getMessagesFromAuthor: ({ commit }, author) => {
      return new Promise((resolve, reject) => {
        instance.get(`/chat/search/thjacque`)
          .then((result: any) => {

            let i = 0;
            const messages = [];
            while (i < result.data.length) {
              messages.push({
                id: result.data[i].id,
                author: result.data[i].author,
                message: result.data[i].message
              });
              i++;
            }
            //console.log(" la response = " + messages[0].id);
            resolve(messages);
          })
      })
    },
    askFriend: ({ commit }, request) => {
      instance.post(`/database/ask/${request.asker}/${request.asked}`);
    },
     acceptFriend:({ commit }, request) => {
      return new Promise((resolve, reject) => {
        instance
          .post(`/database/accept/${request.id}/${request.new}`)
          .then(() => {
            console.log("yes")
            instance
              .get(`/database/friends/${request.id}`)
              .then((result: any) => {
                console.log("get friend", result.data);
                commit("updateFriend", {
                  list: result.data.friends,
                  request: result.data.request,
                  asked: result.data.asked,
                });
                resolve(result.data.friends);
              })
              .catch((err: any) => {
                reject(err);
              });
          });
           })
    },
    removeFriend: ({ commit }, request) => {
      instance.post(`/database/remove/${request.id}/${request.new}`);
    },
    refuseFriend: ({ commit }, request) => {
      instance.post(`/database/refuse/${request.id}/${request.new}`);
    },
    getFriend: ({ commit }, asker) => {
      return new Promise((resolve, reject) => {
        instance
          .get(`/database/friends/${asker}`)
          .then((result: any) => {
            console.log("get friend",result.data);
            commit("updateFriend", {
              list: result.data.friends,
              request: result.data.request,
              asked: result.data.asked,
            });
            resolve(result.data);
          })
          .catch((err: any) => {
            reject(err);
          });
      });
    },
  },
  modules: {},
});
