<template>
  <div id="nav">
    <router-link to="/">Home</router-link> |
    <router-link to="/about">About</router-link> |
    <router-link to="/login">Login</router-link>
  </div>
  <router-view />
</template>

<style>
template {
  height: 100%;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  /* background-color: rgba(0, 0, 0, 0.1); */
}

#nav {
  padding-top: 20px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}



#nav a.router-link-exact-active {
  color: #42b983;
 
}
</style>
