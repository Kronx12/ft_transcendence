<template>
  <!-- <div class="home">
    <img alt="Vue logo" src="../assets/logo.png" />
    <HelloWorld msg="Welcome to Your Vue.js + TypeScript App" />
  </div> -->
  <div id="main">
    <div id="leaderboard">
      <h3>Leaderbord du cul</h3>
    </div>
    <div id="global">
      <h3>Launch game, historics et petits trucs sympa</h3>
    </div>
    <div id="chat">
      <h3>Chat</h3>
    </div>
  </div>
</template>

<style scoped>
template {
  height: 100%;
}
#main {
  background: rgba(0, 0, 0, 0.1);
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  border-radius: 5px;
  height: 1000px;
}

#leaderboard {
  background: rgba(255, 0, 255, 1);
  width: 30%;
  height: 80%;
  float: right;
}

#global {
  background-color: rgb(255, 0, 0);
  width: 60%;
   height: 30%;
}

#chat {
  background-color: rgb(0, 255, 0);
   width: 60%;
   height: 40%;
}
</style>