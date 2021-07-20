/* eslint-disable */
<template>
	<div id="chat">
		<div id="header-chat">Chat</div>
		<div id="list-chat" style="color: white">
			Channels
			<div
				v-for="chat in chats"
				:key="chat"
				class="chat-canal"
				style="color: white"
			>
				<div class="name-canal">
					<a class="chat-name" @click="current_chat = chat.id">{{
						chat.name
					}}</a>
				</div>
				<div class="settings-canal">
					<img src="./../assets/settings.svg" />
					<img src="./../assets/settings.svg" />
				</div>
			</div>
		</div>
		<div id="messages-box-chat">
			<div
				v-for="message in messages"
				:key="message"
				:class="
					message.author == this.$store.state.user.id
						? 'message-current-user'
						: 'message'
				"
			>
				<div v-if="this.$store.state.user.id != message.author">
					<img
						class="user-image"
						v-bind:src="
							'https://cdn.intra.42.fr/users/small_' + message.author + '.jpg'
						"
						style="border-radius: 50%; width: 30px; height: 30px"
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
	</div>
</template>

<script>
export default {
	data() {
		return {
			messages: [],
			chats: [],
			avatarURL: "",
			current_chat: 1,
			inputMessage: "",
			idIntra: -1,
		};
	},
	async mounted() {
		this.avatarURL = this.$store.state.user.avatarURL;
		this.idIntra = this.$store.state.user.id;
		
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
					canalid: this.current_chat,
				};
				this.$store.dispatch("createMessage", msg);
			}
			this.inputMessage = "";
		},
		refreshChat: function () {
			const self = this;
			
			this.idIntra = this.$store.state.user.id;
			if (self.$store != undefined && self.$store != null) {
				self.$store
					.dispatch("getMessagesByCanalId", self.current_chat)
					.then(function (result) {
						self.messages = result;
					});
				self.$store
					.dispatch("getCanalsByUserId", this.$store.state.user.id)
					.then(function (result) {
						self.chats = result;
					});
			}
		},
	},
};
</script>

<style>
@import "./../assets/styles/chat.css";
</style>
