<template>
    <div>
        <h1>Settings</h1>

        <label for="username" style="margin-right: 10px">New Username: </label>
        <input type="text" id="username " v-model="name" style="margin-right: 10px"/>
        <button @click="editUsername()" >Edit</button>
        <br>
        <br>
        <label for="avatar-url" style="margin-right: 10px">New Avatar: </label>
        <input type="text" id="avatar-url" style="margin-right: 10px" v-model="avatar"/>
        <button @click="editAvatar()" >Edit</button>
    </div>
</template>

<script>

export default {
  data() {
    return {
      name: '',
      avatar: ''
    }
  },
  mounted: function() {
    console.log(this.$store.state.user.id)
    if (this.$store.state.user.id == -1)
      this.$router.push('/login')
  },
  methods: {
    editUsername: function() {
      this.$store.state.user.login = this.name
      this.name = ''
    },
    editAvatar: function() {
      this.$store.state.user.avatarURL = this.avatar
      this.avatar = ''
    }
  }
}
</script>