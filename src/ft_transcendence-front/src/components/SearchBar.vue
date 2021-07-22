<template>
    <div>
      <input v-on:keyup.enter="searchUser()" @input="getList()"
        class="search-bar"
        v-if="this.$store.state.user.id != -1"
        type="search"
        v-model="search"
        placeholder="search login..."
      />
      <ul v-if="list.length" class="list dropdown-menu text-small shadow show">
        <li v-for="item in list" :key="item" class="list-user">
          <img v-bind:src="item.avatar" :key="item" id="avatar" @click="goToUser(item.username)">
          <router-link @click="reset()" :key="item" :to="`/user/${item.username}`"
					>{{ item.username }}</router-link><br>
        </li>
      </ul>
      <button
        class="search-button"
        v-if="this.$store.state.user.id != -1"
        @click="searchUser()"
      >
        Search
      </button>
    </div>
</template>

<script>

export default {
    data() {
        return {
            search: "",
            list: []
        }
    },
    methods: {
      searchUser: function () {
        if (this.search == "")
          return;
        if (this.search == this.$store.state.user.login)
          this.$router.push("/profile");
        else this.$router.push(`/user/${this.search}`);
        this.search = "";
      },
      goToUser: function(user) {
         this.$router.push(`/user/${user}`);
         this.search = "";
         this.list = [];
      },
      reset: function() {
        this.list = [];
      },
      getList: async function() {
      const self = this;
      this.reset();
      if (this.search == "")
        return;
        console.log("search:", this.search)
      await this.$store
        .dispatch("searchUser", this.search)
        .then(async (result) => {
          if (result.type == "unique") {
            self.list[0] = {username: result.data.username, avatar: result.data.avatar}
          }
          else {
            self.list = result.data;
          }
        })
      }
    }
}
</script>

<style>
.search-button {
  position: absolute;
  left: 500px;
}
.search-bar {
  position: absolute;
  left: 300px;
}
.list {
  position: absolute;
	margin: 10px;
  left: 290px;
  top: 51px;
  background: white;
  border: solid black 1px;
}
.list-user {
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
</style>