<template>
  <header id="nav">
    <span id="state" style="position: absolute; left: 10px"
      >{{ state ? "Connected" : "Disconnected" }} |
      {{ this.$store.state.user.id }}<br
    /></span>
    <div class="container-fluid">
    <SearchBar />
      <router-link @click="checkOpenProfile()" to="/">Home</router-link>
      <span v-if="this.$store.state.user.id == -1"> | </span>
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
    <div id="list-chat">List</div>
    <div id="messages-box-chat">
      Today
      <section class="chat-box">
        <div
          v-for="message in messages"
          :key="message"
          :class="
            message.author == 'thallard' ? 'message-current-user' : 'message'
          "
        >
          <div class="username" :key="message">{{ message.author }}</div>
          <img class="user-image" :src="avatarURL" style="border-radius:50%; width: 30px; height: 30px;" />
          <div class="message-inner">
            <div class="content" :key="message">{{ message.message }}</div>
          </div>
        </div>
      </section>
    </div>
    <form @submit.prevent="messageSubmit" id="input-chat" autocomplete="off">
      <input
        type="text"
        id="input-text-chat"
        v-model="inputMessage"
        placeholder="Write a message..."
      />
      <input type="submit" id="input-submit-chat" value="Send" />
    </form>
    <!-- INVITATION SECTION -->
    <div>
    </div>
  </div>
  <router-view />
</template>

<script>
import { server } from "./helper";
const jwt = require("jsonwebtoken");
import { mapState } from "vuex";
import SearchBar from './components/SearchBar.vue';
import Friends from './components/Friends.vue';
import ProfileMenu from './components/ProfileMenu.vue'
export default {
  name: "App",
  components: {
    SearchBar,
    Friends,
    ProfileMenu
  },
  data() {
    return {
      connection: null,
      state: false,
      id: this.$store.state.user.id,
      in_queue: false,
      in_bonus: false,
      inputMessage: null,
      messages: [],
      avatarURL: this.$store.state.user.avatarURL,
    };
  },
  methods: {
    checkOpenProfile: function () {
      this.$refs.profile.closeProfile();
      this.$refs.friend.closeFriend();
    },
    disconnectStatus: async function handler(e) {
      if (this.$store.state.user.id != -1)
        await this.$store.dispatch("editStatus", { id: this.$store.state.user.id, status: 0 });
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
      console.log("le user " + this.$store.state.user.login);
      return;
    },
    refreshChat: function () {
      const self = this;
      setInterval(function () {
        if (self.$store != undefined && self.$store != null)
          self.$store
            .dispatch("getMessagesFromAuthor", "thallard")
            .then(function (result) {
              self.messages = result;
            });
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
      this.connection.onmessage = function (event) {
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
          console.log("RECEIVE INVITE");
          console.log(data);
          
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

#user {
  position: absolute;
  top: 0;
  right: 0;
  display: table;
}


#dropdown-profile {
  right: 0;
  /* position:absolute;
   display: table;
   padding-right: 130px;
   list-style: none;
   border: 1px solid black; */
  position: absolute;
  inset: 0px auto auto 0px;
  margin: 0px;
  transform: translate3d(-110px, 34px, 0px);
}

#commu {
  width: 40px;
  height: 40px;
  position: absolute;
  top: 10px;
  right: 200px;
  cursor: pointer;
}


.dropdown-item2:hover {
  background-color: grey;
}
#nav {
  z-index: 2 !important;
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
#nav {
  padding-top: 20px;
  position: relative;
}
#nav a {
  font-weight: bold;
  color: #2c3e50;
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
  margin-top: 15%;
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
#messages-box-chat {
  width: 70%;
  height: 80%;
  overflow-y: scroll;
}

.message {
  font-weight: bold;
  font-size: 15px;
  color: #fff;
  font-family: Avenir;
  float: left;
  position: relative;
  background-color: red;
  z-index: 9;
  width: 40%;
  margin: 10px;
  padding: 10px;
  border-radius: 10px;
  margin-left: 10%;
}

.message-current-user {
  font-weight: bold;
  font-size: 15px;
  color: #fff;
  font-family: Avenir;
  float: right;
  position: relative;
  background-color: dodgerblue;
  z-index: 9;
  width: 40%;
  margin: 10px;
  padding: 10px;
  border-radius: 10px;
  margin-left: 20%;
}

#input-chat {
  position: relative;
  margin-top: 7%;
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
  background-color: dodgerblue;
  border-radius: 8px;
  color: rgb(240, 240, 240);
  font-size: 18px;
  font-weight: 700;
}

</style>
