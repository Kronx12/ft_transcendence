<template>
	<div>
		<h1>Queue</h1>
		<span>{{count}}</span><br>
        <button @click="leave_queue()">Leave Queue</button>
	</div>
</template>

<script>
import Router from 'vue-router';

export default {
	name: "Queue",
	data() {
		return {
			count: 0,
		}
	},
	methods: {
		leave_queue() {
			if (this.$root.in_queue)
				this.$root.connection.send(JSON.stringify({ type: 'leave_queue', content: {id: this.$root.id} }));
			else
				this.$router.push({path: '/'});
		}
	},
	created() {
		const self = this;
		
		this.$root.connection.onmessage = function(event) {
			console.log(event);
			const data = JSON.parse(event.data);
			if (data.type === "comfirmation_leave") {
				console.log("Comfirmation leaving queue");
				self.$root.in_queue = false;
				self.$router.push({path: '/'});
			} else if (data.type === "send_count") {
				self.count = data.content.count
			} else if (data.type === "start_game") {
				self.$router.push({path: '/game', query: {room_id: data.content.room_id}});
			}
		}
	},
}
</script>

<style>

</style>