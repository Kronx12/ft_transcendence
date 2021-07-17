<template>
    <div>
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
    </div>
</template>

<script>

export default {
    data() {
        return {
            search: "",
        }
    },
    methods: {
    searchUser: function () {
      if (this.search == this.$store.state.user.login)
        this.$router.push("/profile");
      else this.$router.push(`/user/${this.search}`);
      this.search = "";
    },
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
</style>