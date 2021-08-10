<template>
	<div>
		<h1>Queue</h1>
		<span v-if="this.$root.in_queue">{{count}}</span><br>
        <button v-if="this.$root.in_queue && !this.$root.in_bonus" @click="leave_queue_standard()">Leave Queue</button>
        <button v-else-if="!this.$root.in_queue" @click="join_queue_standard()">Join Queue Standard</button>
        <button v-if="this.$root.in_queue && this.$root.in_bonus" @click="leave_queue_bonus()">Leave Queue</button>
        <button v-else-if="!this.$root.in_queue" @click="join_queue_bonus()">Join Queue Bonus</button>
	</div>
</template>

<script>
export default {
	name: "Queue",
	data() {
		return {
			count: 0,
		}
	},
	methods: {
		join_queue_standard() {
			if (!this.$root.in_queue)
				this.$root.connection.send(JSON.stringify({type: 'emit_join_standard', content: {user: this.$store.state.user}}));
			else
				this.$router.push({path: '/queue'});
		},
		leave_queue_standard() {
			if (this.$root.in_queue)
				this.$root.connection.send(JSON.stringify({type: 'emit_leave_standard',content: {user: this.$store.state.user}}));
			else
				this.$router.push({path: '/'});
		},
		join_queue_bonus() {
			if (!this.$root.in_queue)
				this.$root.connection.send(JSON.stringify({type: 'emit_join_bonus', content: {user: this.$store.state.user}}));
			else
				this.$router.push({path: '/queue'});
		},
		leave_queue_bonus() {
			if (this.$root.in_queue)
				this.$root.connection.send(JSON.stringify({type: 'emit_leave_bonus',content: {user: this.$store.state.user}}));
			else
				this.$router.push({path: '/'});
		}
	},
	created() {
		const self = this;
		
        self.$root.connection.send(JSON.stringify({ type: "ack_user", content: { user: self.$store.state.user } }));
		
		this.$root.connection.onmessage = function(event) {
			//console.log(event);
			const data = JSON.parse(event.data);

			if (data.type === "ack_join_standard") {
				//console.log("Comfirmation joining queue");
				self.$root.in_queue = true;
				self.$root.in_bonus = false;
			} else if (data.type === "ack_leave_standard") {
				//console.log("Comfirmation leaving queue");
				self.$root.in_queue = false;
			} else if (data.type === "ack_join_bonus") {
				//console.log("Comfirmation joining queue");
				self.$root.in_queue = true;
				self.$root.in_bonus = true;
			} else if (data.type === "ack_leave_bonus") {
				//console.log("Comfirmation leaving queue");
				self.$root.in_queue = false;
			} else if (data.type === "emit_count") {
				self.count = data.content.count
			} else if (data.type === "emit_start_standard") {
				self.$root.in_queue = false;
				self.$router.push({path: '/game', query: {room_id: data.content.room_id}});
			} else if (data.type === "emit_start_bonus") {
				self.$root.in_queue = false;
				self.$router.push({path: '/game_bonus', query: {room_id: data.content.room_id}});
			}
		}
	},
}
</script>

<style>

</style>