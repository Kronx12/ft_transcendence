<template>
  <div>User: {{ $route.params.user }}</div>
</template>

<script>
export default {
  mounted: function () {
    if (this.$store.state.user.id == -1) this.$router.push("/login");
  },
};
</script>
