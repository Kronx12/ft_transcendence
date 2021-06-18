<template>
  <div>
    <h1>Bonjour</h1>
	<router-link v-if="this.$store.state.user.id != -1" to="/queue">Join Game</router-link>
  </div>
</template>

<script>

export default {
  mounted: function() {
    if (this.$store.state.user.id == -1)
      this.$router.push('/login')
  }
}
</script>
