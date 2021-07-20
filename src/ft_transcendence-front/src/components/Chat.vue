/* eslint-disable */
<template>
	<div id="chat">
		<div id="header-chat">Chat</div>
		<div id="list-chat">
			<div @click="createNewCanal()">
				<img class="icon" src="../assets/plus.svg" />
				Channels
			</div>
			<div v-for="chat in chats" :key="chat" class="chat-canal" >
				<div class="name-canal">
					<a class="chat-name" @click="canalid = chat.id">
						{{ chat.name }}
					</a>
				</div>
				<div class="settings-canal">
					<img src="./../assets/settings.svg" />
					<img src="./../assets/settings.svg" />
				</div>
			</div>
		</div>
		<div id="messages-box-chat">
			<div v-for="message in messages" :key="message" :class="message.author == this.userid ? 'message-current-user' : 'message'">
				<div v-if="this.userid != message.author">
					<img class="user-image" v-bind:src="'https://cdn.intra.42.fr/users/small_' + message.author + '.jpg'" />
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
		<form v-if="this.canalid != -1" ref="formChat" @submit.prevent="messageSubmit" id="input-chat" autocomplete="off">
			<input type="text" id="input-text-chat" v-model="inputMessage" placeholder="Write a message..." />
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
			setTimeout(function() { self.refreshChat(); }, 1000);
		},
		// Submit messages data to database
		messageSubmit: function () {
			if (this.inputMessage == null || this.inputMessage == "") {
				return;
			}
			console.log("le message " + this.inputMessage);
			console.log("le user " + this.$store.state.user.avatarURL);

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
			if (self.$store != undefined && self.$store != null) {
				self.$store
					.dispatch("getCanalsByUserId", this.$store.state.user.id)
					.then(function (result) {
						self.chats = result;
					});
				self.$store
					.dispatch("getMessagesByCanalId", self.canalid)
					.then(function (result) {
						self.messages = result;
					});
			}
		},
		createNewCanal: function () {
			this.$root.admin = true;
			this.$root.admin_method = "create";
		}
	},
};
</script>

<style>
@import "./../assets/styles/chat.css";
</style>
