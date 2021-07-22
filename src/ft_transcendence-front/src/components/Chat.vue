/* eslint-disable */
<template>
	<div id="chat">
		<div id="header-chat">Chat</div>
		<div id="list-chat">
			<div id="add-button" @click="createNewCanal()">
				<img class="icon" src="../assets/add.svg" />
			</div>
			<div v-for="chat in chats" :key="chat" class="chat-canal">
				<img
					id="chat-canal-visibility"
					v-if="chat.visibility == 0"
					src="../assets/earth-globe.svg"
				/>
				<img
					id="chat-canal-visibility"
					v-else-if="chat.visibility == 1"
					src="../assets/lock.svg"
				/>
				<img
					id="chat-canal-visibility"
					v-else-if="chat.visibility == 2"
					src="../assets/chat.svg"
				/>
				<a class="chat-canal-link" @click="canalid = chat.id">
					{{ chat.name }}
				</a>
				<img
					id="chat-canal-settings"
					v-if="chat.id == canalid"
					@click="updateUsers()"
					src="../assets/user.svg"
				/>
				<img
					id="chat-canal-settings"
					v-if="chat.id == canalid"
					@click="updateCanal()"
					src="../assets/settings.svg"
				/>
			</div>
		</div>
		<div id="messages-box-chat">
			<div
				v-for="message in messages"
				:key="message"
				:class="
					message.author == this.userid ? 'message-current-user' : 'message'
				"
			>
				<div
					v-if="this.userid != message.author"
					v-on:click="goToUserProfile(getUserImage(message.author))"
				>
					<img
						class="user-image"
						v-bind:src="
							'https://cdn.intra.42.fr/users/small_' +
							getUserImage(message.author) +
							'.jpg'
						"
						v-bind:alt="getUserImage(message.author)"
					/>
					<div class="content" :key="message">
						{{ message.message }}
					</div>
				</div>
				<div v-else>
					<div class="content" :key="message">
						{{ message.message }}
					</div>
				</div>
			</div>
		</div>
		<form
			v-if="this.canalid != -1"
			ref="formChat"
			@submit.prevent="messageSubmit"
			id="input-chat"
			autocomplete="off"
		>
			<input
				type="text"
				id="input-text-chat"
				v-model="inputMessage"
				placeholder="Write a message..."
			/>
			<input type="submit" id="input-submit-chat" value="Send" />
		</form>
		<h3 v-else>SELECT A CANAL FIRST</h3>
	</div>
</template>

<script>
export default {
	data() {
		return {
			messages: [],
			chats: [],
			avatarURL: "",
			canalid: -1,
			inputMessage: "",
			userid: -1,
			userImage: "",
			canalname: "",
		};
	},
	async mounted() {
		this.avatarURL = this.$store.state.user.avatarURL;
		this.userid = this.$store.state.user.id;

		var objDiv = document.getElementById("messages-box-chat");
		if (objDiv != null) objDiv.scrollTop = objDiv.scrollHeight;
		this.activate();
	},
	methods: {
		async activate() {
			var self = this;
			setTimeout(function () {
				self.refreshChat();
			}, 1000);
		},
		// Submit messages data to database
		messageSubmit: function () {
			if (this.inputMessage == null || this.inputMessage == "") return;

			if (this.$store != undefined && this.$store != null) {
				let msg = {
					id: null,
					author: this.$store.state.user.id,
					message: this.inputMessage,
					canalid: this.canalid,
				};
				this.$store.dispatch("createMessage", msg);
			}
			this.inputMessage = "";
		},
		refreshChat: function () {
			const self = this;

			this.userid = this.$store.state.user.id;
			setInterval(function () {
				if (self.$store != undefined && self.$store != null) {
					self.$store
						.dispatch("getCanalsByUserId", self.$store.state.user.id)
						.then(function (result) {
							self.chats = result;
						});
					self.$store
						.dispatch("getMessagesByCanalId", self.canalid)
						.then(function (result) {
							self.messages = result;
						});
						// self.getCanalName(self.$store.state.canalid);
				}
			}, 1000);
		},
		createNewCanal: function () {
			this.$root.admin = 1;
			this.$root.admin_method = "create";
		},
		updateCanal: function () {
			this.$root.admin = 1;
			this.$root.admin_method = "update";
			this.$root.admin_id = this.canalid;
		},
		updateUsers: function () {
			this.$root.admin = 2;
			this.$root.admin_method = "update";
			this.$root.admin_id = this.canalid;
		},
		getUserImage: function (id) {
			const self = this;

			if (
				self.$store != undefined &&
				self.$store != null &&
				id != null &&
				id != undefined
			) {
				self.$store.dispatch("getUser", id).then(function (result) {
					// console.log(result.username + " " + id);
					self.userImage = result.username;
				});
				return self.userImage;
			}
			self.userImage = "thallard";
			return self.userImage;
		},
		goToUserProfile: function (user) {
			if (user != undefined && user != null) this.$router.push(`/user/${user}`);
		},
		getCanalName: function () {
			const self = this;
			if (self.$store != undefined && self.$store != null)
				self.$store
					.dispatch("getCanalById", self.$store.state.canalid)
					.then(function (result) {
						self.canalname = result.name;
					});
		},
	},
};
</script>

<style>
@import "./../assets/styles/chat.css";
</style>
