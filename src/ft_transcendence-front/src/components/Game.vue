<template>
	<vue-p5 v-on="{ setup, draw }"></vue-p5>
</template>

<script>
import VueP5 from 'vue-p5';

export default {
	data() {
		return {
			xa: 0, ya: 0,
			xb: 0, yb: 0
		}
	},
	components: {
		"vue-p5": VueP5,
	},
	methods: {
		setup(sk) {
			sk.background('black');
		},
		draw(sk) {
			let update_keys = false;
			sk.clear();
			sk.background('black');

			if (sk.keyIsDown(38) && !sk.keyIsDown(40)) {
				this.ya -= 1;
				update_keys = true;
			} else if (sk.keyIsDown(40) && !sk.keyIsDown(38)) {
				this.ya += 1;
				update_keys = true;
			}
			
			if (sk.keyIsDown(37)) {
				this.xa -= 1;
				update_keys = true;
			} else if (sk.keyIsDown(39)) {
				this.xa += 1;
				update_keys = true;
			}

			sk.ellipse(this.xa, this.ya, 10, 10);
			sk.ellipse(this.xb, this.yb, 10, 10);

			if (update_keys)
				this.$root.connection.send(JSON.stringify({type: 'emit_key', content: {room_id: this.$route.query.room_id, user: this.$store.state.user, x: this.xa, y: this.ya}}));
		},
	},
	created() {
		const self = this;
		
		this.$root.connection.onmessage = function(event) {
			const data = JSON.parse(event.data);
			if (data.type === "ack_key") {
				self.xb = data.content.x;
				self.yb = data.content.y;
			}
		}
	},
};
</script>

<style>

</style>