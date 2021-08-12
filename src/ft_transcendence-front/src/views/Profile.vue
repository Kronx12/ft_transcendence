<template>
  <div v-if="id != -1">
    <h1>{{ login }}</h1>
    <img v-if="id == this.$store.state.user.id" @click="goSettings()" @mouseenter="hoverimageMouse()" @mouseout="hoverimageMouse()"  id="avatar-profile" v-bind:src=avatar />  
    <div @click="goSettings()" v-if="hoverimage" class="hoverImage">Edit Avatar</div>

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
      <div class="history">
        <h1>History</h1>
        <div class="box-history" v-for="item in history" :key="item">
          <div :key="item" v-if="item.win == id" class="game-history win">
          <span class="p">{{item.p1_l}} vs {{item.p2_l}}</span> | Score: {{item.s1}} : {{item.s2}} | Type : {{item.type ? "Bonus" : "Standard"}}
          </div>
          <div v-else class="game-history loose">
          <span class="p">{{item.p1_l}} vs {{item.p2_l}}</span> | Score: {{item.s1}} : {{item.s2}} | Type : {{item.type ? "Bonus" : "Standard"}}
          </div>
        </div>
      </div>
    </div>
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
      history: [],
      last: "",
      win: 0,
      loose: 0,
      blocked: 0,
      hoverimage: 0
    };
  },
  methods: {
    hoverimageMouse: function(){
            this.hoverimage = !this.hoverimage;
        },
        goSettings: function() {
            this.$router.push("/settings")
        },
    searchUser: async function () {
      const self = this;
      await this.$store
        .dispatch("searchUser", this.$store.state.user.login)
        .then(async (result) => {
          if (result.type == "unique") {
            self.id = result.data.intra_id;
            self.login = result.data.username;
            self.avatar = result.data.avatar;
            //console.log("history", result.data.game_history);
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
            if(history != "")
            {
            for(let x in history)
            {
                await self.$store.dispatch("getGameById", history[x]).then(async (result) => {
                  //console.log(history[x], result)
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
          }
          }
        });
    },
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

#button-block {
  background-color: red !important;
}

#button-unblock {
  background-color: green !important;
}

.hoverImage {
  position: absolute;
  top: 225px;
  right: 1215px;
  font-weight: 600;
  color: white;
  border: solid black 1px;
  background: rgb(223, 210, 210);
  padding-left: 20px;
  padding-right: 20px;
}

.history {
  width: 100%;
  text-align: center;
  text-transform: uppercase;
}

.box-history {
  color: white;
  font-weight: bold;
  text-shadow: 0.1em 0.1em 0.2em black;
}

.game-history {
  margin: 5px;
  padding: 5px;
  background-color: #2c3e50;
}

.win {
  border-bottom: 2px solid green;
  border-left: 10px solid green;
}

.loose {
  border-bottom: 2px solid red;
  border-left: 10px solid red;
}

.p {
  color: gold;
}

</style>
