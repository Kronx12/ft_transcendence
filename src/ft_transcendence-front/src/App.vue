<template>
  <header id="nav">
     <span id="state" style="position: absolute; left:  10px;">{{ state ? 'Connected' : 'Disconnected' }} | {{ this.$store.state.user.id }}<br></span>
    <div class="container-fluid">

    <router-link @click="checkOpenProfile()" to="/">Home</router-link>
    <span v-if="this.$store.state.user.id == -1"> | </span>
    <router-link v-if="this.$store.state.user.id == -1" to="/login">Login</router-link> 
   
    <div class="flex-shrink-0 dropdown" id="header">
              
      <div id="avatar-bootstrap">
        <span @click="openProfile()" id="login">{{ this.$store.state.user.login }}</span> 
          <img @click="openProfile()" id="avatar" v-if="this.$store.state.user.id != -1" v-bind:src=this.$store.state.user.avatarURL />
          <ul v-if="showProfile" @mouseout="openProfile()" class="dropdown-menu text-small shadow show" aria-labelledby="dropdownUser2" data-popper-placement="bottom-end" style="position: absolute; inset: 0px auto auto 0px; margin: 10px; transform: translate3d(-110px, 34px, 0px);">
            <li @click="openProfile()" class="dropdown-item" for="li-drop1"><router-link id="li-drop1" to="/profile">Profile</router-link></li>
            <li @click="openProfile()" class="dropdown-item" for="li-drop1"><router-link id="li-drop1" to="/settings">Settings</router-link></li>
            <li><hr class="dropdown-divider"></li>
             <li @click="openProfile()" class="dropdown-item"><router-link id="li-drop1" to="/logout">Logout</router-link></li>
          </ul>
        </div>
      </div>
    </div>
  <router-view />
  </header>
</template>

<script>
import {server} from './helper'
export default {
  data() {
    return {
      showProfile: 0,
      connection: null,
			state:  false,
			id: this.$store.state.user.id,
			in_queue: false
    }
  },
  methods: {
    openProfile: function(){
      this.showProfile = !this.showProfile
    },
    checkOpenProfile: function(){
      if (this.showProfile)
        this.showProfile = !this.showProfile
    }
  },
  updated() {
    if (this.$store.state.user.id != -1 && this.connection == null) {
      this.connection = new WebSocket(server.socketURL);

      const self = this;

      this.connection.onopen = function(event) {
        console.log(event);
        self.state = true;
        console.log("Connected !");    
      }
      this.connection.onclose = function(event) {
        console.log(event);
        self.state = false;
        console.log("Disconnected !, Try to reconnect");
        this.connection = new WebSocket(server.socketURL);
      }
      this.connection.onmessage = function(event) {
        console.log(event);
        const data = JSON.parse(event.data);
        console.log(self.$store.state.user);
        if (data.type === "emit_user") { // Send user at connection
          self.connection.send(JSON.stringify({type: "ack_user",content: {user:self.$store.state.user}}));
        }
      }
    }
	}
}
</script>
<style>
#header {
  position: absolute;
  top: 0;
  right: 0;
  margin-top: 13px;

}
#avatar-bootstrap
{
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
  position:absolute;
   top:0;
   right:0;
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
#login::selection { background: transparent; } 
#login::-moz-selection { background: transparent; }

#dropdown-profile {
   right:0;
  /* position:absolute;
   display: table;
   padding-right: 130px;
   list-style: none;
   border: 1px solid black; */
   position: absolute; inset: 0px auto auto 0px; margin: 0px; transform: translate3d(-110px, 34px, 0px);
}
#li-drop1
{
      text-decoration: none;
      display: block;
}


</style>
