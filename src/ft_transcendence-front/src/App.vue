<template>
  <header id="nav">
    <span id="state" style="position: absolute; left: 10px"
      >{{ state ? "Connected" : "Disconnected" }} |
      {{ this.$store.state.user.id }}<br
    /></span>
    <div class="container-fluid">
      <input
        class="search-bar"
        v-if="this.$store.state.user.id != -1"
        type="search"
        v-model="search"
        placeholder="search login..."
      />
      <button
        class="search-button"
        v-if="this.$store.state.user.id != -1"
        @click="searchUser()"
      >
        Search
      </button>
      <router-link @click="checkOpenProfile()" to="/">Home</router-link>
      <span v-if="this.$store.state.user.id == -1"> | </span>
      <router-link v-if="this.$store.state.user.id == -1" to="/login"
        >Login</router-link
      >
      <a class="fixedButton">
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
          <span @click="openProfile()" id="login">{{
            this.$store.state.user.login
          }}</span>
          <img
            @click="openProfile()"
            id="avatar"
            v-if="this.$store.state.user.id != -1"
            v-bind:src="this.$store.state.user.avatarURL"
          />
          <ul
            v-if="showProfile"
            @mouseleave="openProfile()"
            class="dropdown-menu text-small shadow show"
            aria-labelledby="dropdownUser2"
            data-popper-placement="bottom-end"
            style="
              position: absolute;
              inset: 0px auto auto 0px;
              margin: 10px;
              transform: translate3d(-110px, 34px, 0px);
            "
          >
            <li @click="openProfile()" class="dropdown-item" for="li-drop1">
              <router-link id="li-drop1" to="/profile">Profile</router-link>
            </li>
            <li @click="openProfile()" class="dropdown-item" for="li-drop1">
              <router-link id="li-drop1" to="/settings">Settings</router-link>
            </li>
            <li><hr class="dropdown-divider" /></li>
            <li @click="openProfile()" class="dropdown-item">
              <router-link id="li-drop1" to="/logout">Logout</router-link>
            </li>
          </ul>
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
          :class="message.author == 'thallard' ? 'message-current-user' : 'message'"
        >
            <div class="username" :key="message">{{ message.author }}</div>
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
  </div>
  <router-view />
</template>

<script>
import { server } from "./helper";
const jwt = require("jsonwebtoken");
import { mapState } from "vuex";
import { ref } from "vue";
export default {
  data() {
    return {
      showProfile: 0,
      connection: null,
      state: false,
      id: this.$store.state.user.id,
      in_queue: false,
      in_bonus: false,
      inputMessage: ref(""),
      messages: [],
      search: "",
    };
  },
  methods: {
    openProfile: function () {
      this.showProfile = !this.showProfile;
    },
    checkOpenProfile: function () {
      if (this.showProfile) this.showProfile = !this.showProfile;
    },
    searchUser: function () {
      if (this.search == this.$store.state.user.login)
        this.$router.push("/profile");
      else this.$router.push(`/user/${this.search}`);
      this.search = "";
    },
    editStatus: function () {
      this.$store.dispatch("editStatus", { id: this.id, status: 0 });
    },
    chatAppear: async function () {
      const self = this;
      var chat = document.getElementById("chat");
      if (chat === null) return;
      if (chat.style.display === "block") chat.style.display = "none";
      else chat.style.display = "block";

     

      return {};
    },
    messageSubmit: function () {
      if (this.inputMessage.value != null || this.inputMessage.value != "")
        console.log(this.inputMessage.value);
      return;
    },
  },
  computed: {
    ...mapState(["status"]),
  },
  created() {
    document.addEventListener("beforeunload", this.editStatus);
  },
  async mounted() {
    const self = this;
    jwt.verify(
      localStorage.getItem("jwtToken"),
      "shhhhh",
      function (err, decoded) {
        if (err) console.log("Not logged in, go /login");
        else {
          self.$store.state.user.id = decoded.id;
          self.$store.state.user.login = decoded.login;
          self.$store.state.user.avatarURL = decoded.avatarURL;
          self.$store.dispatch("editStatus", { id: decoded.id, status: 1 });
        }
        
      }
    );
     await self.$store
        .dispatch("getMessagesFromAuthor", "thallard")
        .then(function (result) {
          console.log("ID = " + result[0].id);
          self.messages = result;
        });
        console.log(" ca monte mon cochon " + self.messages);
  },
  updated() {
    if (this.$store.state.user.id != -1 && this.connection == null) {
      this.connection = new WebSocket(server.socketURL);

      const self = this;

      this.connection.onopen = function (event) {
        console.log(event);
        self.state = true;
        console.log("Connected !");
      };

      this.connection.onclose = function (event) {
        console.log(event);
        self.state = false;
        console.log("Disconnected !, Try to reconnect");
        this.connection = new WebSocket(server.socketURL);
      };
      this.connection.onmessage = function (event) {
        console.log(event);
        const data = JSON.parse(event.data);
        console.log(self.$store.state.user);
        if (data.type === "emit_user") {
          // Send user at connection
          self.connection.send(
            JSON.stringify({
              type: "ack_user",
              content: { user: self.$store.state.user },
            })
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

.search-button {
  position: absolute;
  left: 500px;
}
.search-bar {
  position: absolute;
  left: 300px;
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
