<template>
  <div>
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
</template>

<script>
export default {
  data() {
    return {
      showProfile: 0,
    };
  },
  methods: {
    openProfile: function () {
      this.showProfile = !this.showProfile;
      this.$emit("closeFriend");
    },
    closeProfile: function() {
        this.showProfile = 0;
    }
  },
};
</script>


<style>
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
  position: absolute;
  right: 100px
}
#login::selection {
  background: transparent;
}
#login::-moz-selection {
  background: transparent;
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

#li-drop1 {
  text-decoration: none;
}

#li-drop1::selection {
  background: transparent;
}
#li-drop1::-moz-selection {
  background: transparent;
}
</style>