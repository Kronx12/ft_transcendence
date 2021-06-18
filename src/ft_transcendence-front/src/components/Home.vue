<template>
	<div>
		<h1>Home</h1>
		<button @click="join_queue()">Join Game</button>
	</div>
</template>

<script>
export default {
	name: "Home",
	methods: {
		join_queue() {
			if (!this.$root.in_queue)
				this.$root.connection.send(JSON.stringify({ type: 'join_queue', content: {id: this.$root.id} }));
			else
				this.$router.push({path: '/queue'});
		},
	},
	created() {
		const self = this;

		this.$root.connection.onmessage = function(event) {
			console.log(event);
			const data = JSON.parse(event.data);
			if (data.type === "comfirmation_join") {
				console.log("Comfirmation joining queue");
				self.$root.in_queue = true;
				self.$router.push({path: '/queue'});
			}
		}
	},
}
</script>

<style>

</style>