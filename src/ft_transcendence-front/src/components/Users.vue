<template>
  <div v-if="id != -1">
    <h1>{{ login }}</h1>
    <img class="avatar-user" :src="avatar" />
  </div>
  <div class="users-aff" v-else-if="result.length">
      <div v-for="user in result" :key="user">
      <figure>
       <img @click="goToUser(user.username)" id="avatar-user-search" :key="user.avatar" :src="user.avatar" />
       <figcaption @click="goToUser(user.username)" :key="user.username">{{user.username}}</figcaption>
       </figure>
       </div>
  </div>
  <div v-else>
    <h1>User not foud...</h1>
  </div>
</template>

<script>
export default {
  data() {
    return {
      id: -1,
      login: "",
      avatar: "",
      result: [],
      last: "",
    };
  },
  methods: {
    searchUser: function () {
      const self = this;
      this.$store
        .dispatch("searchUser", this.$route.params.user)
        .then((result) => {
          if (result.type == "unique") {
            self.id = result.data.intra_id;
            self.login = result.data.username;
            self.avatar = result.data.avatar;
          } else {
            self.result = result.data;
          }
        });
    },
    goToUser: function(user) {
      this.$router.push(`/user/${user}`)
    }
  },
  mounted: function () {
    if (this.$store.state.user.id == -1) this.$router.push("/login");
    this.last = this.$route.params.user;
    this.searchUser();
  },
  updated() {
    if (this.$route.params.user != this.last) {
      console.log("edited");
      this.last = this.$route.params.user;
      (this.id = -1), (this.login = ""), (this.avatar = ""), (this.result = []);
      this.searchUser();
    }
  },
};
</script>

<style>
#avatar-user-search {
  width: 100px;
  height: 100px;
  margin-right: 1rem;
  cursor: pointer;
}
div.user-aff{
  float: right;
}
</style>
