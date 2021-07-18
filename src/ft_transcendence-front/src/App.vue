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
			<Friends ref="friend" @openFriends="this.$refs.profile.closeProfile()" />
        	<ProfileMenu ref="profile" @openProfile="this.$refs.friend.closeFriend()" />
        </div>
      </div>
    </div>
  </header>
  <div id="chat">
    <div id="header-chat">Chat</div>
    <div id="list-chat" style="color: white">
      Channels
      <div
        v-for="chat in chats"
        :key="chat"
        class="chat-canal"
        style="color: white"
      >
        <div class="name-canal">
          <a class="chat-name" @click="current_chat = chat.id">{{
            chat.name
          }}</a>
        </div>
        <div class="settings-canal">settings</div>
      </div>
    </div>
    <div id="messages-box-chat">
      <div
        v-for="message in messages"
        :key="message"
        :class="message.author == username ? 'message-current-user' : 'message'"
      >
        <div v-if="username != message.author">
          <img
            class="user-image"
            v-bind:src="
              'https://cdn.intra.42.fr/users/small_' + message.author + '.jpg'
            "
            style="border-radius: 50%; width: 30px; height: 30px"
          />

          <div class="content" :key="message">
            {{ message.message }}
          </div>
        </div>
        <div v-else>
          <div class="content" :key="message">
            {{ message.message }}
          </div>
        </div>
      </div>
    </div>
    <form
      ref="formChat"
      @submit.prevent="messageSubmit"
      id="input-chat"
      autocomplete="off"
    >
      <input
        type="text"
        id="input-text-chat"
        v-model="inputMessage"
        placeholder="Write a message..."
      />
      <input type="submit" id="input-submit-chat" value="Send" />
    </form>
  </div>

  <!-- INVITATION SECTION -->
  <div class="global-invitation" v-for="i in invitation" v-bind:key="i.id">
    <Invitation
      :type="i.type"
      :transmitter="i.transmitter"
      :receiver="i.receiver"
    />
  </div>
  <router-view />
</template>

<script>
import { server } from "./helper";
const jwt = require("jsonwebtoken");
import { mapState } from "vuex";
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
    };
  },
  methods: {
    accept: async function (id) {
      for (var i = 0; i < this.request.length; i++) {
        if (this.request[i].id === id) {
          this.request.splice(i, 1);
        }
      }
      const self = this;
      console.log({ asker: self.$store.state.user.id, asked: id });
      await self.$store.dispatch("acceptFriend", {
        id: self.$store.state.user.id,
        new: id,
      });
	  await self.$refs.friend.updateFriend();
    },
    refuse: async function (id) {
      for (var i = 0; i < this.request.length; i++) {
        if (this.request[i].id === id) {
          this.request.splice(i, 1);
        }
      }
      this.$store.dispatch("refuseFriend", {
        id: this.$store.state.user.id,
        new: id,
      });
      await this.updateFriend();
    },
    openProfile: function () {
      this.showProfile = !this.showProfile;
    },
    checkOpenProfile: function () {
      if (this.showProfile) this.showProfile = !this.showProfile;
    },
    openFriends: async function () {
      console.log("firends console: ", this.friend);
      console.log("requ console: ", this.request);
      this.showFriends = !this.showFriends;
    },
    searchUser: function () {
      if (this.search == this.$store.state.user.login)
        this.$router.push("/profile");
      else this.$router.push(`/user/${this.search}`);
      this.search = "";
    },
    disconnectStatus: async function handler(e) {
      if (this.$store.state.user.id != -1)
        await this.$store.dispatch("editStatus", {
          id: this.$store.state.user.id,
          status: 0,
        });
    },
    haveRequest: function () {
      if (this.$store.state.user.id == -1) return false;
      const friends = this.$store.state.friends.request;
      // console.log(friends);
      if (friends == "") return false;
      return true;
    },
    chatAppear: async function () {
      const self = this;
      var chat = document.getElementById("chat");
      if (chat === null) return;
      if (chat.style.display === "block") chat.style.display = "none";
      else chat.style.display = "block";

      return {};
    },
    // Submit messages data to database
    messageSubmit: function () {
      if (this.inputMessage == null && this.inputMessage == "") return;

      console.log("le message " + this.inputMessage);
      console.log("le user " + this.$store.state.user.avatarURL);

      if (this.$store != undefined && this.$store != null) {
        let chat = {
          id: null,
          author: this.$store.state.user.login,
          message: this.inputMessage,
          canalid: this.current_chat,
        };
        this.$store.dispatch("addMessage", chat);
      }
      this.inputMessage = "";
      this.refreshChat();
      self.$refs.friend.refreshFriend();
    },
    refreshChat: function () {
      const self = this;
      setInterval(function () {
        if (self.$store != undefined && self.$store != null) {
          self.$store
            .dispatch("getMessagesCanal", self.current_chat)
            .then(function (result) {
              self.messages = result;
              // console.log("le numero du chat = " + self.current_chat);
            });
          self.$store
            .dispatch("getAllChats", "thallard")
            .then(function (result) {
              self.chats = result;
            });
        }
      }, 1000);
    },
    updateFriend: async function () {
      const self = this;
      await self.$store.dispatch("getFriend", self.$store.state.user.id);
      const request = self.$store.state.friends.request.split(":");
      const schema = { id: "", username: "" };
      if (request != "") {
        for (const x in request) {
          schema.id = request[x];
          await self.$store
            .dispatch("getUser", request[x])
            .then(function (data) {
              schema.username = data.username;
            });
          self.request[x] = schema;
          console.log(x, schema);
        }
      }
      console.log(self.request);
      self.friend = self.$store.state.friends.list.split(":");
      if (self.friend != "") {
        for (const x in self.friend) {
          schema.id = self.friend[x];
          await self.$store
            .dispatch("getUser", self.friend[x])
            .then(function (data) {
              schema.username = data.username;
            });
          self.friend[x] = schema;
          console.log(x, schema);
        }
      }
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
	var chat = document.getElementById("chat");
		chat.style.display = "none";
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
    self.refreshChat();
    self.$refs.friend.refreshFriend();
  },
  async updated() {
    const self = this;

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
#chat {
  float: left;
  position: absolute;
  background-color: rgba(240, 240, 240, 1);
  width: 30%;
  height: 65%;
  margin-left: 68%;
  margin-top: 10%;
  z-index: 5 !important;
  display: block;
  border-radius: 5px;
  transition: all 0.1s;
  -webkit-transition: all 0.1s;
}
#header-chat {
  font-weight: bold;
  font-family: Avenir, cursive;
  font-size: 18px;
  color: #fff;
  background-color: #2c3e50;
  height: 10%;
  width: 100%;
  border-radius: 5px 5px 0 0;
  text-align: center;
}
#list-chat {
  background-color: #2c3e50;
  float: left;
  /* position: absolute; */
  width: 30%;
  border-top: 1px solid;
  border-color: #fff;
  height: 90%;
  border-radius: 0 0 0 5px;
}

.chat-canal {
  z-index: 8 !important;
  width: 100%;
  background-color: #2c3e50;
}
#messages-box-chat {
  width: 70%;
  height: 83%;
  overflow-y: scroll;
  flex-direction: column-reverse;
}

.message {
  font-weight: bold;
  font-size: 15px;
  color: #fff;
  font-family: Avenir;
  float: left;
  z-index: 9;
  width: 60%;
  border-radius: 10px;
  margin-right: 50%;
  padding: 10px;
}

.message-current-user {
	font-weight: bold;
	font-size: 15px;
	color: #fff;
	font-family: Avenir;
	float: right;
	z-index: 9;
	width: 45%;
	padding: 10px;
	border-radius: 10px;
	margin-left: 10%;
}

.message-current-user .content {
  background-color: #599cba;
  width: auto;
  max-width: 100%;
  flex: auto;
  float: right;
  border-radius: 10px;
  word-wrap: break-word;
  padding: 10px 15px;
  text-align: left;
  line-height: 25px;
}

.message .content {
  background-color: #9fa0a4;
  width: auto;
  max-width: 70%;
  float: left;
  border-radius: 10px;
  word-wrap: break-word;
  padding: 10px 15px;
  margin-left: 2%;
  text-align: left;
  line-height: 25px;
}

.chat-canal {
	margin-top: 5px;
	font-size: 20px;
	text-align: left;
	padding-left: 10px;
	border-top: 1px solid;
	border-bottom: 1px solid;
}

.name-canal {
	max-width: 30%;
	width: auto;
	height: 10%;
	max-height: 10%;
	float: left;

}

.name-canal a {
	text-decoration: none;
	font-weight: bold;
	color: white !important;
}

.settings-canal {
	height: 5%;
	background-color: blue;
	width: auto;
	max-width: 40%;
	margin-left: auto;
	
}

.settings-canal img {
	height: 25%;
	width: 25%;
	float:right;
	margin: 3px;
	
}

.message .user-image {
  z-index: 10;
  float: left;
}

#input-chat {
  position: relative;
  margin-top: 2%;
}

#input-text-chat {
  appearance: none;
  border: none;
  outline: none;
  background: none;
  display: block;
  width: 50%;
  padding: 10px 15px;
  border-radius: 8px;
  margin-bottom: 15px;
  margin-left: 30%;
  position: absolute;
  color: #333;
  font-size: 18px;
  box-shadow: 0px 0px 0px rgba(0, 0, 0, 0);
  background-color: rgb(220, 220, 220);
  transition: 0.4s;
}
#input-submit-chat {
  appearance: none;
  border: none;
  outline: none;
  background: none;
  display: block;
  position: relative;
  margin-left: 80%;
  width: 20%;
  padding: 10px 15px;
  background-color: #599cba;
  border-radius: 8px;
  color: rgb(240, 240, 240);
  font-size: 18px;
  font-weight: 700;
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
