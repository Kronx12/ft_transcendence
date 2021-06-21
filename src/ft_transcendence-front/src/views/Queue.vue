<template>
	<div>
		<h1>Queue</h1>
		<span v-if="this.$root.in_queue">{{count}}</span><br>
        <button v-if="this.$root.in_queue" @click="leave_queue()">Leave Queue</button>
        <button v-else @click="join_queue()">Join Queue</button>
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
		join_queue() {
			if (!this.$root.in_queue)
				this.$root.connection.send(JSON.stringify({type: 'emit_join', content: {user: this.$store.state.user}}));
			else
				this.$router.push({path: '/queue'});
		},
		leave_queue() {
			if (this.$root.in_queue)
				this.$root.connection.send(JSON.stringify({type: 'emit_leave',content: {user: this.$store.state.user}}));
			else
				this.$router.push({path: '/'});
		}
	},
	created() {
		const self = this;
		
		this.$root.connection.onmessage = function(event) {
			console.log(event);
			const data = JSON.parse(event.data);
            
			if (data.type === "ack_join") {
				console.log("Comfirmation joining queue");
				self.$root.in_queue = true;
			} else if (data.type === "ack_leave") {
				console.log("Comfirmation leaving queue");
				self.$root.in_queue = false;
			} else if (data.type === "emit_count") {
				self.count = data.content.count
			} else if (data.type === "emit_start") {
				self.$root.in_queue = false;
				self.$router.push({path: '/game', query: {room_id: data.content.room_id}, params: {serverwidth: data.content.server_width, serverheight: data.content.server_height}});
			}
		}
	},
}
</script>

<style>

</style>