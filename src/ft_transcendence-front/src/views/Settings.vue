<template>
    <div>
        <h1>Settings</h1>

        <label for="username" style="margin-right: 10px">New Username: </label>
        <input v-on:keyup.enter="editUsername()" type="text" id="username " v-model="name" style="margin-right: 10px"/>
        <button @click="editUsername()" >Edit</button>
        <br>
        <br>
        <label for="avatar-url" style="margin-right: 10px">New Avatar: </label>
        <input v-on:keyup.enter="editAvatar()" type="text" id="avatar-url" style="margin-right: 10px" v-model="avatar"/>
        <button @click="editAvatar()" >Edit</button>
        <br>
        <br>
        <div v-if="!have2Auth()"><h2 style="color: red;">2FA is not enabled !</h2><br>
          <button @click="pair(secret)">Enable !</button><br>
          <img :src="auth_qr" />
          <div v-if="auth_qr != ''">
            <label>Verification code: </label><br>
            <input type="text" id="verif_qr" v-model="validation"><br>
              <label v-if="incorrect" style="color: red;">Incorrect !</label><br v-if="incorrect">
            <button @click="validate()" >Pair the account</button>
          </div>
        </div>
        <div v-else><h2 style="color: green;">2FA is enabled !</h2></div>
    </div>
</template>

<script>

export default {
  data() {
    return {
      name: '',
      avatar: '',
      secret: this.$store.state.user.secret,
      auth_qr: '',
      validation: '',
      incorrect: false
    }
  },
  mounted: function() {
    //console.log(this.$store.state.user.id)
    if (this.$store.state.user.id == -1)
      this.$router.push('/login')
  },
  methods: {
    editUsername: function() {
      if (this.name == "")
        return;
      this.$store.state.user.login = this.name
      this.$store.dispatch("editUsername", {id: this.$store.state.user.id, username: this.name})
    },
    editAvatar: function() {
      if (this.avatar == "")
        return;
      this.$store.state.user.avatarURL = this.avatar
      this.$store.dispatch("editAvatar", {id: this.$store.state.user.id, avatar: this.avatar})
    },
    have2Auth: function() {
      return this.$store.state.user.auth
    },
    pair: function(secret) {
      const self = this;
      this.$store.dispatch("pair", {username: this.$store.state.user.login, code: this.$store.state.user.secret}).then((result) =>{
        self.auth_qr = result.data.split("img src='")[1].split("'")[0];
      })
    },
    validate: async function() {
    const self = this;
    await this.$store.dispatch("validate", {secret: this.$store.state.user.secret, code: this.validation}).then(async function(result) {
      //console.log(result.data);
      if (result.data == "False")
        self.incorrect = true;
      else
      {
          self.incorrect = false;
          self.$store.state.user.auth = true;
          await self.$store.dispatch("activateAuth", {id: self.$store.state.user.id});
      }
    })
    }
  }
}
</script>