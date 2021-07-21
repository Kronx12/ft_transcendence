<template>
  <div v-if="id != -1">
    <h1>{{ login }}</h1>
    <img class="avatar-user" :src="avatar" />

    <button v-if="accept" @click="acceptFriend()">Accept friend !</button>
    <button v-else-if="add" @click="addFriend()">Add friend !</button>
    <button v-else-if="remove" @click="removeFriend()">Remove friend !</button>
    <h1 v-else-if="aske">Request sended !</h1>
    <div v-if="invite && id != this.$store.state.user.id">
      <button class="button" @click="sendInviteClassic()">Invite for normal game</button>
      <button class="button" @click="sendInviteBonus()">Invite for bonus game</button>
    </div>
    <hr>
    <div style="width:100%;display: block" id="stats">
      <h1 style="width:100%">Stats</h1>
      <div style="width:100%">
        <div class="wins">
          Wins: {{win}}
        </div>
        <div class="looses">
          Looses: {{loose}}
        </div>
        <div class="winrate">
          W/L rates: {{ (loose + win) > 0 ? win * 100 / (loose+win) : 0 }}%
        </div>
      </div>
      <hr>
      <div class="history" style="width:100%">
        <h1>History</h1>
        <div class="history-box" v-for="item in history" :key="item">
          <div :key="item" v-if="item.win == id" style="background: green">
          {{item.p1_l}} vs {{item.p2_l}} | Score: {{item.s1}} : {{item.s2}} | Type : {{item.type ? "Bonus" : "Standard"}}
          </div>
          <div v-else style="background: red">
          {{item.p1_l}} vs {{item.p2_l}} | Score: {{item.s1}} : {{item.s2}} | Type : {{item.type ? "Bonus" : "Standard"}}
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="users-aff" v-else-if="result.length">
    <div v-for="user in result" :key="user" style="width: 20% !important; margin-left: auto; margin-right: auto;">
      <figure>
        <img
          @click="goToUser(user.username)"
          id="avatar-user-search"
          :key="user.avatar"
          :src="user.avatar"
        />
        <figcaption @click="goToUser(user.username)" :key="user.username">
          {{ user.username }}
        </figcaption>
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
      history: [],
      asked: [],
      last: "",
      accept: 0,
      add: 0,
      remove: 0,
      aske: 0,
      invite: 1,
      win: 0,
      loose: 0
    };
  },
  methods: {
    searchUser: async function () {
      const self = this;
      await this.$store
        .dispatch("searchUser", this.$route.params.user)
        .then(async (result) => {
          if (result.type == "unique") {
            self.id = result.data.intra_id;
            self.login = result.data.username;
            self.avatar = result.data.avatar;
            self.isFriend();
            self.haveAsked();
            console.log("history", result.data.game_history);
            let history = result.data.game_history.split(":");
            let schema = {
              p1: "",
              p2: "",
              p1_l: "",
              p2_l: "",
              win: "",
              win_l: "",
              s1: 0,
              s2: 0,
              type: 0
            }
            for(let x in history)
            {
                await self.$store.dispatch("getGameById", history[x]).then(async (result) => {
                  console.log(history[x], result)
                  schema.p1 = result.player_1;
                  schema.s1 = result.score_1;

                  schema.p2 = result.player_2;
                  schema.s2 = result.score_2;

                  schema.win = result.victory;
                  await self.$store.dispatch("getUser", schema.p1).then(function (data) {
              schema.p1_l = data.username
            })
                   await self.$store.dispatch("getUser", schema.p2)
            .then(function (data) {
              schema.p2_l = data.username
            })

              await self.$store.dispatch("getUser", schema.win)
            .then(function (data) {
              schema.win_l = data.username
            })
                  schema.type = result.type;

                  if (result.victory == self.id)
                    self.win++;
                  else
                    self.loose++;
                })
                self.history.push({...schema});
            }
          } else {
            self.result = result.data;
          }
        });
    },
    goToUser: function (user) {
      this.$router.push(`/user/${user}`);
    },
    isFriend: function () {
      if (this.$store.state.user.id == this.id) return;
      const friends = this.$store.state.friends.list.split(":");
      for (const x in friends) if (friends[x] == this.id) this.remove = 1;
      const asked = this.$store.state.friends.asked.split(":");
      for (const x in asked) if (asked[x] == this.id) this.aske = 1;
      if (!this.remove && !this.aske && !this.accept) this.add = 1;
    },
    haveAsked: function () {
      if (this.$store.state.user.id == this.id) return;
      const friends = this.$store.state.friends.request.split(":");

      for (const x in friends) if (friends[x] == this.id) this.accept = 1;
      return false;
    },
    addFriend: async function () {
      await this.$store.dispatch("askFriend", {
        asker: this.$store.state.user.id,
        asked: this.id,
      });
      await this.$store
        .dispatch("getFriend", this.$store.state.user.id)
        .then((voi) => {
          console.log(voi);
        });
      this.isFriend();
      this.haveAsked();
      this.aske = 1;
      this.add = 0;
    },
    acceptFriend: async function () {
      await this.$store.dispatch("acceptFriend", {
        id: this.$store.state.user.id,
        new: this.id,
      });
      await this.$store
        .dispatch("getFriend", this.$store.state.user.id)
        .then((voi) => {
          console.log(voi);
        });
      this.accept = 0;
      this.add = 0;
      this.remove = 1;
    },
    removeFriend: async function () {
      await this.$store.dispatch("removeFriend", {
        id: this.$store.state.user.id,
        new: this.id,
      });
      await this.$store
        .dispatch("getFriend", this.$store.state.user.id)
        .then((voi) => {
          console.log(voi);
        });
      this.remove = 0;
      this.add = 1;
    },
		waitForSocketConnection(socket, callback) {
			const self = this
			setTimeout(
				function () {
					if (socket.readyState === 1) {
						console.log("Connection is made")
						if (callback != null){
							callback();
						}
					} else {
						console.log("wait for connection...")
						self.waitForSocketConnection(socket, callback);
					}

				}, 5);
		},
    sendInviteClassic: function() {
      const self = this
      console.log(this.$store.state.user.id, this.id);
      this.waitForSocketConnection(self.$root.connection, function() {
        self.$root.connection.send(JSON.stringify({type: 'emit_send_invite_classic', content: { transmitter: self.$store.state.user.id, receiver: self.id }}));
      });
    },
    sendInviteBonus: function() {
      const self = this
      console.log(this.$store.state.user.id, this.id);
      this.waitForSocketConnection(self.$root.connection, function() {
        self.$root.connection.send(JSON.stringify({type: 'emit_send_invite_bonus', content: { transmitter: self.$store.state.user.id, receiver: self.id }}));
      });
    }
  },
  async beforeMount() {
    await this.$store.dispatch("getFriend", this.$store.state.user.id);
  },
  mounted: function () {
    if (this.$store.state.user.id == -1) this.$router.push("/login");
    this.last = this.$route.params.user;
    this.searchUser();
  },
  async updated() {
    if (this.$route.params.user != this.last) {
      const self = this;
      await this.$store.dispatch("getFriend", this.$store.state.user.id);
      this.last = this.$route.params.user;
      (this.id = -1), (this.login = ""), (this.avatar = ""), (this.result = []);
      await this.searchUser();
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
div.user-aff {
  float: right;
}
.button {
  background-color: #008CBA;
  border: none;
  color: white;
  padding: 10px 20px;
  margin: 5px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  font-weigth: bold;
}
.button:hover {
  background-color: #4CAF50;
  border: none;
  color: white;
  padding: 10px 20px;
  margin: 5px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  font-weigth: bold;
}
.button:focus {
  background-color: #f44336;
  border: none;
  color: white;
  padding: 10px 20px;
  margin: 5px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
}

.history-box {
  width: 30%;
  color: white;
  border: solid black 2px;
}


</style>
