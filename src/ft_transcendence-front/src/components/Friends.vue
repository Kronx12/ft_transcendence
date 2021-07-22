/* eslint-disable */
<template>
	<div>
		<img
			@click="openFriends()"
			v-if="this.$store.state.user.id != -1"
			id="commu"
			src="https://image.flaticon.com/icons/png/512/417/417723.png"
		/>
		<div id="notif" v-if="haveRequest()"></div>
		<ul
			v-if="showFriends"
			class="dropdown-menu text-small shadow show"
			data-popper-placement="bottom-end"
			style="
				position: absolute;
				inset: 0px auto auto 0px;
				margin: 10px;
				transform: translate3d(-110px, 34px, 0px);
			"
		>
			<li v-for="item in request" :key="item">
				<router-link
					:key="item"
					id="li-drop2"
					class="dropdown-item2"
					@click="openFriends()"
					:to="`/user/${item.username}`"
					>{{ item.username }}</router-link
				>
				<button
					:key="item"
					style="margin-left: 5px; color: white; background-color: green"
					@click="accept(item.id)"
					v-if="item.id != ''"
				>
					✓</button
				><button
					:key="item"
					@click="refuse(item.id)"
					style="color: white; background-color: red"
					v-if="item.id != ''"
				>
					x
				</button>
			</li>
			<li v-if="haveRequest()"><hr class="dropdown-divider" /></li>
			<li v-if="friend == ''">You have no friends...</li>
			<li v-else v-for="item in friend" :key="item">
				<router-link
					:key="item"
					@click="openFriends()"
					class="dropdown-item"
					id="li-drop1"
					:to="`/user/${item.username}`"
					>{{ item.username }}
					<div class="ingame" :key="item" v-if="item.status == 2"></div>
					<div class="online" :key="item" v-if="item.status == 1"></div>
					<div class="offline" :key="item" v-if="item.status == 0"></div
				></router-link>
			</li>
		</ul>
	</div>
</template>

<script>
export default {
  data() {
    return {
      showFriends: 0,
      request: [],
      friend: [],
    };
  },
  methods: {
    accept: async function (id) {
      for (var i = 0; i < this.request.length; i++) {
        if (this.request[i].id === id) {
          this.request.splice(i, 1);
        }
      }
      const self = this;
      console.log({ asker: self.$store.state.user.id, asked: id });
      await self.$store.dispatch("acceptFriend", {
        id: self.$store.state.user.id,
        new: id,
      });
      await this.updateFriend();
    },
    refuse: async function (id) {
      for (var i = 0; i < this.request.length; i++) {
        if (this.request[i].id === id) {
          this.request.splice(i, 1);
        }
      }
      this.$store.dispatch("refuseFriend", {
        id: this.$store.state.user.id,
        new: id,
      });
      await this.updateFriend();
    },
    openFriends: async function () {
      this.showFriends = !this.showFriends;
      this.$emit("openFriends");
    },
    closeFriend: function() {
        this.showFriends = 0;
    },
    haveRequest: function () {
      if (this.$store.state.user.id == -1) return false;
      const friends = this.$store.state.friends.request;
      if (friends == "") return false;
      return true;
    },
    updateFriend: async function () {
      const self = this;
      await self.$store.dispatch("getFriend", self.$store.state.user.id);
       const request = self.$store.state.friends.request.split(":");
      const schema = { id: "", username: "", status: 0 };
      if (request != "") {
        for (const x in request) {
          schema.id = request[x];
          await self.$store
            .dispatch("getUser", request[x])
            .then(function (data) {
              schema.username = data.username;
            });
          self.request[x] = schema;
        }
      }
      let friend = self.$store.state.friends.list.split(":");
      if (friend != "") {
        for (const x in friend) {
          schema.id = friend[x];
          await self.$store
            .dispatch("getUser", friend[x])
            .then(function (data) {
              schema.username = data.username;
              schema.status = data.status;
            });
          friend[x] = schema;
        }
      }
      self.friend = friend;
    },
    refreshFriend: async function () {
      const self = this;
      setInterval(async function () {
        await self.updateFriend();
      }, 1000);
    },
  },
};
</script>

<style>
#notif {
	background: red;
	border-radius: 50%;
	width: 15px;
	height: 15px;
	position: absolute;
	top: 45px;
	right: 195px;
}
.offline {
	background: rgb(175, 174, 174);
	border-color: black;
	border-radius: 50%;
	width: 10px;
	height: 10px;
	position: relative;
}

.online {
	background: rgb(51, 201, 94);
	border-color: black;
	border-radius: 50%;
	width: 10px;
	height: 10px;
	margin-right: 5px;
}

.dropdown-item2 {
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

#li-drop2 {
	text-decoration: none;
}

#li-drop2::selection {
	background: transparent;
}
#li-drop2::-moz-selection {
	background: transparent;
}

.ingame {
	background: rgb(247, 187, 77);
	border-color: black;
	border-radius: 50%;
	width: 10px;
	height: 10px;
	margin-right: 5px;
}
</style>