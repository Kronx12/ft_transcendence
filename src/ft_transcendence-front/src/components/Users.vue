<template>
  <div v-if="id != -1">
    <h1>{{ login }}</h1>
    <img class="avatar-user" :src="avatar" />
    
    <button v-if="accept" @click="acceptFriend()">Accept friend !</button>
    <button v-else-if="add" @click="addFriend()">Add friend !</button>
    <button v-else-if="remove" @click="removeFriend()">Remove friend !</button>
    <h1 v-else-if="aske">Request sended !</h1>
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
      friends: [],
      requests: [],
      asked: [],
      last: "",
      accept: 0,
      add: 0,
      remove: 0,
      aske: 0
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
            self.isFriend();
            self.haveAsked();
          } else {
            self.result = result.data;
          }
        });
    },
    goToUser: function(user) {
      this.$router.push(`/user/${user}`)
    },
    isFriend: function() {
      if (this.$store.state.user.id == this.id)
        return;
      const friends = this.$store.state.friends.list.split(':');
      for (const x in friends)
        if (friends[x] == this.id)
          this.remove = 1;
      const asked = this.$store.state.friends.asked.split(':');
       for (const x in asked)
        if (asked[x] == this.id)
          this.aske = 1
        if (!this.remove && !this.aske && !this.accept)
          this.add = 1;
    },
    haveAsked: function() {

       if (this.$store.state.user.id == this.id)
        return;
      const friends = this.$store.state.friends.request.split(':');
      
      for (const x in friends)
        if (friends[x] == this.id)
          this.accept = 1
      return false;
    },
   addFriend: async function()
    {
      
       await this.$store.dispatch("askFriend", {asker: this.$store.state.user.id, asked: this.id})
       await this.$store.dispatch('getFriend', this.$store.state.user.id).then(voi => {
         console.log(voi)
       })
        this.isFriend();
        this.haveAsked();
        this.aske = 1;
        this.add = 0;
    },
     acceptFriend: async function()
    {
      
       await this.$store.dispatch("acceptFriend", {id: this.$store.state.user.id, new: this.id})
       await this.$store.dispatch('getFriend', this.$store.state.user.id).then(voi => {
         console.log(voi)
       
       })
        this.accept = 0;
        this.add = 0;
        this.remove = 1;
    },
    removeFriend: async function()
    {
     
       await this.$store.dispatch("removeFriend", {id: this.$store.state.user.id, new: this.id})
       await this.$store.dispatch('getFriend', this.$store.state.user.id).then(voi => {
        console.log(voi)
       })
        this.remove = 0;
        this.add = 1;
    }
  },
  async beforeMount() {
    await this.$store.dispatch('getFriend', this.$store.state.user.id)
  },
  mounted: function () {
    if (this.$store.state.user.id == -1) this.$router.push("/login");
    this.last = this.$route.params.user;
    this.searchUser();
   
  },
  async updated() {
    if (this.$route.params.user != this.last) {
      const self = this
      await this.$store.dispatch('getFriend', this.$store.state.user.id);
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
