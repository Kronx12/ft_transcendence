import { resolveComponent } from "@vue/runtime-core";
import { createStore } from "vuex";

const axios = require("axios");

const instance = axios.create({
  baseURL: "http://localhost:3000/",
});

const jwt = require("jsonwebtoken");

export default createStore({
  state: {
    status: "",
    user: {
      id: -1,
      login: "",
      avatarURL: "",
      auth: false,
      secret: ""
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
    setAuth: function (state, auth) {
      state.user.auth = auth;
    },
    logUser: function (state, user) {
      state.user = user;
      console.log(state.user);
    },
    updateFriend: function (state, list) {
      state.friends = list;
    },
  },
  actions: {
    waitIntra: ({ commit }) => {
      commit("setStatus", "loading");
    },
    getToken: ({ commit }, code) => {
      commit("setStatus", "loading");
      return new Promise((resolve, reject) => {
        instance
          .get(`/login/${code}`)
          .then(function (response: any) {
            commit("setStatus", "done");
            localStorage.setItem("ft_token", response.data.token);
            console.log("token", localStorage.getItem("ft_token"));
            resolve(response);
          })
          .catch(function (error: any) {
            commit("setStatus", "error");
            reject(error);
          });
      });
    },
    getUser: ({ commit }, id) => {
      instance.defaults.headers.common["Authorization"] = localStorage.getItem("jwtToken");
      return new Promise((resolve, reject) => {
        instance.get(`/database/user/${id}`).then(function (user: any) {
          
          resolve(user.data);
        });
      });
    },
    authLogin: ({ commit }, token) => {
      commit("setStatus", "loading");
      return new Promise((resolve, reject) => {

        instance
          .post(`/login/${token}`)
          .then(function (response: any) {
            instance
              .get(`/database/user/${response.data.intra_id}`)
              .then(function (user: any) {
                const token = jwt.sign(
                  {
                    id: user.data.intra_id,
                    login: user.data.username,
                    avatarURL: user.data.avatar,
                    auth: user.data.auth,
                    secret: user.data.secret,
                  },
                  "shhhhh",
                  { expiresIn: "1h" }
                );
                localStorage.setItem("jwtToken", token);
                commit("setStatus", "logged");
                commit("logUser", {
                  id: user.data.intra_id,
                  login: user.data.username,
                  avatarURL: user.data.avatar,
                  auth: user.data.auth,
                  secret: user.data.secret,
                });
                instance.patch(`/database/user/${user.data.intra_id}`, {
                  status: 1,
                });
                instance.defaults.headers.common["Authorization"] = token;
                resolve(user.data);
              })
          })
      })
      
    },
    getLogin: ({ commit }, token) => {
      commit("setStatus", "loading");
      return new Promise((resolve, reject) => {
        instance
          .post(`/login/${token}`)
          .then(function (response: any) {
            instance
              .get(`/database/user/${response.data.intra_id}`)
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
                      asked: "",
                      canals: "",
                      secret: makeid(7),
                      auth: false
                    })
                    .then(function (created: any) {
                      const token = jwt.sign(
                        {
                          id: created.data.intra_id,
                          login: created.data.username,
                          avatarURL: created.data.avatar,
                          auth: created.data.auth,
                          secret: created.data.secret,
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
                        auth: created.data.auth,
                        secret: created.data.secret,
                      });
                      resolve(created.data);
                    });
                } else {
                  if (user.data.auth) {
                    console.log("need 2fa")
                    resolve({ auth: true, secret: user.data.secret })
                  }
                  else {
                    const token = jwt.sign(
                      {
                        id: user.data.intra_id,
                        login: user.data.username,
                        avatarURL: user.data.avatar,
                        auth: user.data.auth,
                        secret: user.data.secret,
                      },
                      "shhhhh",
                      { expiresIn: "1h" }
                    );
                    localStorage.setItem("jwtToken", token);
                    commit("setStatus", "logged");
                    commit("logUser", {
                      id: user.data.intra_id,
                      login: user.data.username,
                      avatarURL: user.data.avatar,
                      auth: user.data.auth,
                      secret: user.data.secret,
                    });
                    instance.defaults.headers.common["Authorization"] = token;
                    instance.patch(`/database/user/${user.data.intra_id}`, {
                      status: 1,
                    });
                    resolve({ auth: false });
                  }
                }
              });
            ///resolve(response.data);
          })
          .catch(function (error: any) {
            commit("setStatus", "invalid_token");
            console.log(error);
            reject(error);
          });
      });
    },
    editUsername: ({ commit }, params) => {
      instance.defaults.headers.common["Authorization"] = localStorage.getItem("jwtToken");
      instance.patch(`/database/user/${params.id}`, {
        username: params.username,
      });
    },
    editAvatar: ({ commit }, params) => {
      instance.defaults.headers.common["Authorization"] = localStorage.getItem("jwtToken");
      instance.patch(`/database/user/${params.id}`, { avatar: params.avatar });
    },
    editStatus: ({ commit }, params) => {
      instance.defaults.headers.common["Authorization"] = localStorage.getItem("jwtToken");
      instance.patch(`/database/user/${params.id}`, { status: params.status });
    },
    searchUser: ({ commit }, name) => {
      instance.defaults.headers.common["Authorization"] = localStorage.getItem("jwtToken");
      return new Promise((resolve, reject) => {
        instance.get(`/database/user/search/${name}`).then((result: any) => {
          const response = {
            type: "",
            data: result.data,
          };

          if (result.data.id != undefined) response.type = "unique";
          else response.type = "multiple";
          resolve(response);
        });
      });
    },
    askFriend: ({ commit }, request) => {
      instance.defaults.headers.common["Authorization"] = localStorage.getItem("jwtToken");
      instance.post(`/database/ask/${request.asker}/${request.asked}`);
    },
    acceptFriend: ({ commit }, request) => {
      instance.defaults.headers.common["Authorization"] = localStorage.getItem("jwtToken");
      return new Promise((resolve, reject) => {
        instance
          .post(`/database/accept/${request.id}/${request.new}`)
          .then(() => {
            instance
              .get(`/database/friends/${request.id}`)
              .then((result: any) => {
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
      });
    },
    removeFriend: ({ commit }, request) => {
      instance.defaults.headers.common["Authorization"] = localStorage.getItem("jwtToken");
      instance.post(`/database/remove/${request.id}/${request.new}`);
    },
    refuseFriend: ({ commit }, request) => {
      instance.defaults.headers.common["Authorization"] = localStorage.getItem("jwtToken");
      instance.post(`/database/refuse/${request.id}/${request.new}`);
    },
    getFriend: ({ commit }, asker) => {
      instance.defaults.headers.common["Authorization"] = localStorage.getItem("jwtToken");
      return new Promise((resolve, reject) => {
        instance
          .get(`/database/friends/${asker}`)
          .then((result: any) => {
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
    pair: ({ commit }, secret) => {
      console.log(`${secret.username}/${secret.code}`);
      return new Promise((resolve, reject) => {
        instance.get(`login/2fa/${secret.username}/${secret.code}`).then((result: any) =>{
          resolve(result);
        });
      })
    },
    validate: ({ commit }, params) => {
      return new Promise((resolve, reject) => {
        instance.post(`login/2fa/${params.secret}/${params.code}`).then((result: any) => {
          resolve(result);
        });
      })
    },
    activateAuth: ({ commit }, user) => {
      instance.defaults.headers.common["Authorization"] = localStorage.getItem("jwtToken");
      instance.patch(`/database/user/${user.id}`, { auth: true });
      commit("setAuth", true);
    },
    // ==================================== CHAT SECTION ===================
    // >>>>>>>>>> USER LOGIN >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    getUsersFromIds: ({ commit }, ids) => {
      instance.defaults.headers.common["Authorization"] = localStorage.getItem("jwtToken");
      return new Promise((resolve, reject) => {
        instance.post(`/database/users/`, ids).then((result: any) => {  
          resolve(result.data);
        });
      });
    },

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>


    // >>>>>>>>>> CANAL SECTION
    getCanals: ({ commit }) => {
      instance.defaults.headers.common["Authorization"] = localStorage.getItem("jwtToken");
      return new Promise((resolve, reject) => {
        instance.get(`/canal/`).then((result: any) => {
          const canals: any[] = [];
          if (result == undefined)
            resolve(canals);
          result.data.forEach((e: any) => {
            canals.push({
              id: e.id,
              name: e.name,
              image: e.image,
              owner: e.owner,
              users: e.users,
              admins: e.admins,
              password: e.password,
              visibility: e.visibility
            });
          });
          resolve(canals);
        })
      })
    },
    getCanalById: ({ commit }, canalid) => {
      instance.defaults.headers.common["Authorization"] = localStorage.getItem("jwtToken");
      return new Promise((resolve, reject) => {
        instance.get(`/canal/${canalid}`).then((result: any) => {
          resolve(result.data);
        })
      })
    },
    getCanalsByUserId: ({ commit }, userid) => {
      instance.defaults.headers.common["Authorization"] = localStorage.getItem("jwtToken");
      return new Promise((resolve, reject) => {
        instance.get(`/canal/search/${userid}`).then((result: any) => {
          const canals: any[] = [];
          if (result == undefined)
            resolve(canals);
          result.data.forEach((e: any) => {
            canals.push({
              id: e.id,
              name: e.name,
              image: e.image,
              owner: e.owner,
              users: e.users,
              admins: e.admins,
              password: e.password,
              visibility: e.visibility
            });
          });
          resolve(canals);
        })
      })
    },
    deleteCanal: ({ commit }, canalid) => {
      instance.defaults.headers.common["Authorization"] = localStorage.getItem("jwtToken");
      return new Promise((resolve, reject) => {
        instance.delete(`/canal/${canalid}`).then((result: any) => {
          resolve(result.data);
        })
      })
    },
    createCanal: ({ commit }, canal) => {
      instance.defaults.headers.common["Authorization"] = localStorage.getItem("jwtToken");
      return new Promise((resolve, reject) => {
        instance.post(`/canal/`, canal).then((result: any) => {
          resolve(result.data);
        })
      })
    },
    updateCanal: ({ commit }, canal) => {
      instance.defaults.headers.common["Authorization"] = localStorage.getItem("jwtToken");
      return new Promise((resolve, reject) => {
        instance.patch(`/canal/`, canal).then((result: any) => {
          resolve(result.data);
        })
      })
    },
    getUsersNotInCanal: ({ commit }, canalid) => {
      instance.defaults.headers.common["Authorization"] = localStorage.getItem("jwtToken");
      return new Promise((resolve, reject) => {
        instance.get(`/database/other_users/${canalid}`).then((result: any) => {
          const users: any[] = [];
          if (result == undefined)
            resolve(users);
          result.data.forEach((e: any) => {
            users.push(e.intra_id);
          });
          resolve(users);
        })
      })
    },
    getUsersNotAdmin: ({ commit }, canalid) => {
      instance.defaults.headers.common["Authorization"] = localStorage.getItem("jwtToken");
      return new Promise((resolve, reject) => {
        instance.get(`/canal/non_admin/${canalid}`).then((result: any) => {
          const users: any[] = [];
          if (result == undefined)
            resolve(users);
          result.data.forEach((e: any) => {
            users.push(e.intra_id);
          });
          resolve(users);
        })
      })
    },

    // >>>>>>>>>> MESSAGE SECTION
    
    getMessages: ({ commit }) => {
      instance.defaults.headers.common["Authorization"] = localStorage.getItem("jwtToken");
      return new Promise((resolve, reject) => {
        instance.get(`/message/`).then((result: any) => {
          const messages: any[] = [];
          if (result == undefined)
            resolve(messages);
          result.data.forEach((e: any) => {
            messages.push({
              id: e.id,
              author: e.author,
              message: e.message,
              canalid: e.canalid,
            });
          });
          resolve(messages);
        })
      })
    },
    getMessagesByCanalId: ({ commit }, canalid) => {
      instance.defaults.headers.common["Authorization"] = localStorage.getItem("jwtToken");
      return new Promise((resolve, reject) => {
        instance.get(`/message/${canalid}`).then((result: any) => {
          const messages: any[] = [];
          if (result == undefined)
            resolve(messages);
          result.data.forEach((e: any) => {
            messages.push({
              id: e.id,
              author: e.author,
              message: e.message,
              canalid: e.canalid,
            });
          });
          resolve(messages);
        })
      })
    },
    createMessage: ({ commit }, msg) => {
      instance.defaults.headers.common["Authorization"] = localStorage.getItem("jwtToken");
      return new Promise((resolve, reject) => {
        instance.post(`/message/`, msg).then((result: any) => {
          resolve(result.data);
        })
      })
    },
    // ==================================== END CHAT SECTION ===================
    // ==================================== GAME SECRETION =====================
    getGameById: ({commit}, id) => {
      instance.defaults.headers.common["Authorization"] = localStorage.getItem("jwtToken");
      return new Promise((resolve, reject) => {
        instance.get(`/game_database/${id}`).then((result: any) => {
          resolve(result.data);
        })
      })
    }
  },

  modules: {},
});

function makeid(length: number) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
