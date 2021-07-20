/* eslint-disable */
<template>
  <header id="nav">
    <span id="state" style="position: absolute; left: 10px">
      {{ state ? "Connected" : "Disconnected" }} |
      {{ this.$store.state.user.id }}
      <br />
    </span>
    <div class="container-fluid">
      <SearchBar />
      <router-link @click="checkOpenProfile()" to="/">Home</router-link>
      <span v-if="this.$store.state.user.id == -1">|</span>
      <router-link v-if="this.$store.state.user.id == -1" to="/login"
        >Login</router-link
      >
      <a v-if="this.$store.state.user.id != -1" class="fixedButton">
        <button
          id="roundedFixedBtn"
          @click="chatAppear()"
          class="action-button shadow animate green"
        >
          CHAT
        </button>
        <!-- <div class="roundedFixedBtn">CHAT</div> -->
      </a>

      <div class="flex-shrink-0 dropdown" id="header">
        <div id="avatar-bootstrap">
          <Friends
            ref="friend"
            @openFriends="this.$refs.profile.closeProfile()"
          />
          <ProfileMenu
            ref="profile"
            @openProfile="this.$refs.friend.closeFriend()"
          />
        </div>
      </div>
    </div>
  </header>
  <Chat v-if="this.$store.state.user.id != -1" ref="chat" />
  <!-- INVITATION SECTION -->
  <div class="global-invitation" v-for="i in invitation" v-bind:key="i.id">
    <Invitation
      :type="i.type"
      :transmitter="i.transmitter"
      :receiver="i.receiver"
    />
  </div>
  <ChatAdmin  v-if="this.$store.state.user.id != -1 && this.admin" v-bind:method="this.admin_method" v-bind:id="this.admin_id" />
  <router-view />
</template>

<script>
import { server } from "./helper";
const jwt = require("jsonwebtoken");
import { mapState } from "vuex";
import Chat from "./components/Chat.vue";
import ChatAdmin from "./components/ChatAdmin.vue";
import SearchBar from "./components/SearchBar.vue";
import Friends from "./components/Friends.vue";
import ProfileMenu from "./components/ProfileMenu.vue";
import Invitation from "./components/Invitation.vue";

export default {
  name: "App",
  components: {
    SearchBar,
    Friends,
    ProfileMenu,
    Invitation,
    Chat,
    ChatAdmin,
  },
  data() {
    return {
      showProfile: 0,
      showFriends: 0,
      connection: null,
      state: false,
      id: this.$store.state.user.id,
      in_queue: false,
      in_bonus: false,
      inputMessage: null,
      messages: [],
      search: "",
      request: [],
      friend: [],
      username: "",
      chats: [],
      current_chat: "1",
      invitation: [],
      avatarURL: this.$store.state.user.avatarURL,
      type: "NORMAL",
      result: {},
      admin: false,
      admin_method: "create",
      admin_id: "0",
    };
  },
  methods: {
    checkOpenProfile: function () {
      this.$refs.profile.closeProfile();
      this.$refs.friend.closeFriend();
    },
    disconnectStatus: async function handler(e) {
      if (this.$store.state.user.id != -1)
        await this.$store.dispatch("editStatus", {
          id: this.$store.state.user.id,
          status: 0,
        });
    },
    chatAppear: function () {
      var chat = document.getElementById("chat");
      if (chat === null) return;
      if (chat.style.display === "block") chat.style.display = "none";
      else chat.style.display = "block";

      return {};
    },
    checkToken: async function () {
      const self = this;
      setInterval(function () {
        jwt.verify(
          localStorage.getItem("jwtToken"),
          "shhhhh",
          async function (err, decoded) {
            if (err) {
              self.$store.state.user.id = -1;
              self.$store.state.user.login = "";
              self.$store.state.user.avatarURL = "";
              self.$store.state.user.auth = "";
              self.$store.state.user.secret = "";
              self.$router.push("/login");
            }
          }
        );
      }, 5000);
    },
  },
  computed: {
    ...mapState(["status", "friends"]),
  },
  created() {
    window.addEventListener("beforeunload", this.disconnectStatus);
    window.addEventListener("onunload", this.disconnectStatus);
  },
  async beforeMount() {
    if (this.$store.state.user.id != -1) {
      await this.$store.dispatch("getFriend", this.$store.state.user.id);
    }
  },

  async mounted() {
    const self = this;
    jwt.verify(
      localStorage.getItem("jwtToken"),
      "shhhhh",
      async function (err, decoded) {
        if (err) console.log("Not logged in, go /login");
        else {
          self.$store.state.user.id = decoded.id;
          self.$store.state.user.login = decoded.login;
          self.$store.state.user.avatarURL = decoded.avatarURL;
          self.$store.state.user.auth = decoded.auth;
          self.$store.state.user.secret = decoded.secret;
          self.$store.dispatch("editStatus", { id: decoded.id, status: 1 });
          await self.$store.dispatch("getFriend", self.$store.state.user.id);
          await self.$refs.friend.updateFriend();
        }
      }
    );

    self.$refs.friend.refreshFriend();
    self.checkToken();
  },
  async updated() {
    console.log("oui");
    const self = this;
    console.log("le login = " + self.$store.state.user.login);

    if (this.connection == null) {
      this.connection = new WebSocket(server.socketURL);

      this.connection.onopen = function (event) {
        self.state = true;
        console.log("Connected !");
      };

      this.connection.onclose = function (event) {
        self.state = false;
        console.log("Disconnected !, Try to reconnect");
        this.connection = new WebSocket(server.socketURL);
      };
      this.connection.onmessage = async function (event) {
        const data = JSON.parse(event.data);
        if (data.type === "emit_user") {
          // Send user at connection
          self.connection.send(
            JSON.stringify({
              type: "ack_user",
              content: { user: self.$store.state.user },
            })
          );
        } else if (data.type == "invitation_send") {
          let tmp = {};
          console.log("RECEIVE INVITE");
          console.log(self.$store.state.user.id);
          console.log(data.content.transmitter);
          if (self.$store.state.user.id == data.content.transmitter) {
            console.log(data.content.receiver);
            await self.$store
              .dispatch("getUser", data.content.receiver)
              .then(function (d) {
                self.result = d;
              });
            console.log("RESULT A:");
            console.log(self.result);
            self.result.id = self.result.intra_id;
            self.result.avatarURL = self.result.avatar;
            self.result.login = self.result.username;
            tmp = {
              type: data.content.type,
              transmitter: self.$store.state.user,
              receiver: self.result,
            };
            console.log(tmp);
          } else {
            console.log(data.content.transmitter);
            await self.$store
              .dispatch("getUser", data.content.transmitter)
              .then(function (d) {
                self.result = d;
              });
            console.log("RESULT B:");
            console.log(self.result);
            self.result.id = self.result.intra_id;
            self.result.avatarURL = self.result.avatar;
            self.result.login = self.result.username;
            tmp = {
              type: data.content.type,
              transmitter: self.result,
              receiver: self.$store.state.user,
            };
            console.log(tmp);
          }
          self.invitation.push(tmp);
        } else if (data.type == "invitation_accepted") {
          console.log("ACCEPTED");
          self.invitation = self.invitation.filter(
            (obj) =>
              obj.type !== data.content.type &&
              obj.transmitter !== data.content.transmitter &&
              obj.receiver !== data.content.receiver
          );
          if (data.content.type == 0)
            self.$router.push({
              path: "/game",
              query: { room_id: data.content.uuid },
            });
          else if (data.content.type == 1)
            self.$router.push({
              path: "/game_bonus",
              query: { room_id: data.content.uuid },
            });
        } else if (data.type == "invitation_declined") {
          console.log("DECLINED");
          console.log(data);
          self.invitation = self.invitation.filter(
            (obj) =>
              obj.type !== data.content.type &&
              obj.transmitter !== data.content.transmitter &&
              obj.receiver !== data.content.receiver
          );
        }
      };
    }
  },
};
</script>
<style>
#header {
  position: absolute;
  top: 0;
  right: 0;
  margin-top: 13px;
}
#avatar-bootstrap {
  display: flex;
  position: absolute;
  right: 0;
  top: 0;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  /* background-color: rgba(0, 0, 0, 0.1); */
}

#nav {
  padding: 30px;
  border: 2px solid black;
  /* background-color: rgb(253, 226, 191); */
  margin-bottom: 20px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #2c3e50;
}
#avatar {
  height: 60px;
  width: 60px;
  background-repeat: no-repeat;
  background-size: 100%;
  background-position: 50% 50%;
  border-radius: 50%;
  margin-right: 2rem;
  padding: 10px;
  display: table-cell;
  vertical-align: middle;
  cursor: pointer;
}
#user {
  position: absolute;
  top: 0;
  right: 0;
  display: table;
}

#login {
  font-family: Futura PT, Futura, Helvetica, Sans serif;
  font-size: 1.2em;
  font-weight: bold;
  color: #666;
  margin-bottom: 0;
  padding-top: 13px;
  /* padding-right: 1rem; */
  vertical-align: middle;
  display: table-cell;
  cursor: pointer;
}
#login::selection {
  background: transparent;
}
#login::-moz-selection {
  background: transparent;
}

#dropdown-profile {
  right: 0;
  position: absolute;
  inset: 0px auto auto 0px;
  margin: 0px;
  transform: translate3d(-110px, 34px, 0px);
}
#li-drop1 {
  text-decoration: none;
  display: block;
}

#li-drop1::selection {
  background: transparent;
}
#li-drop1::-moz-selection {
  background: transparent;
}

#li-drop2 {
  text-decoration: none;
}

#li-drop2::selection {
  background: transparent;
}
#li-drop2::-moz-selection {
  background: transparent;
}

#commu {
  width: 40px;
  height: 40px;
  position: absolute;
  top: 10px;
  right: 200px;
  cursor: pointer;
}
.search-button {
  position: absolute;
  left: 500px;
}
.search-bar {
  position: absolute;
  left: 300px;
}

.dropdown-item2 {
  display: initial;
  width: 100%;
  padding: 0.25rem 1rem;
  clear: both;
  font-weight: 400;
  color: #212529;
  text-align: inherit;
  text-decoration: none;
  white-space: nowrap;
  background-color: transparent;
  border: 0;
}
.dropdown-item2:hover {
  background-color: grey;
}
#nav {
  z-index: 2 !important;
  padding-top: 20px;
  position: relative;
}
template {
  height: 100%;
}
#app {
  z-index: 1 !important;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  /* background-color: rgba(0, 0, 0, 0.1); */
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}
#nav a.router-link-exact-active {
  color: #42b983;
}
#fixedbutton {
  float: right;
  position: fixed;
  margin-top: 50%;
  margin-right: 500px;
  text-decoration: none;
  padding: 10px 40px;
  margin: 0px 10px 10px 0px;
  /* float: left; */
}

.fixedButton {
  position: fixed;
  bottom: 0px;
  right: 0px;
  padding: 20px;
}

#roundedFixedBtn {
  height: 60px;
  line-height: 80px;
  width: 100px;
  font-weight: bold;
  text-align: center;
  cursor: pointer;
  border-radius: 10px;
  font-family: Avenir, cursive;
  font-size: 15px;
  color: #fff;
  text-decoration: none;
  border: 0px;
  background-color: #82bf56;
  border-bottom: 5px solid #669644;
  text-shadow: 0px -2px #669644;
  transition: all 0.1s;
  -webkit-transition: all 0.1s;
}
.action-button:active {
  transform: translate(0px, 5px);
  -webkit-transform: translate(0px, 5px);
  border-bottom: 1px solid;
  /* margin-bottom: 50px; */
}
.animate {
  transition: all 0.1s;
  -webkit-transition: all 0.1s;
}

#notif {
  background: red;
  border-radius: 50%;
  width: 15px;
  height: 15px;
  position: absolute;
  top: 45px;
  right: 195px;
}
.global-invitation {
  width: 280px;
  filter: drop-shadow(5px 0px 4px #666);
  z-index: 4 !important;
}
</style>
