<template>
	<vue-p5 v-on="{ setup, draw }"></vue-p5>
</template>

<script>
import VueP5 from 'vue-p5';

export default {
	data() {
		return {
			vx: 1, vy: 1,
			xa: 0, ya: 0,
			xb: 0, yb: 0,
			server_width: 0,
			server_height: 0,
			ballx: 0, bally: 0, ballr: 15,
			rv: 0,
			rwidth: 0, rheight: 0,
		}
	},
	components: {
		"vue-p5": VueP5,
	},
	methods: {
		setup(sk) {
			sk.createCanvas(sk.windowWidth / 2, sk.windowHeight / 2, sk.WEBGL);
			this.server_width = this.$route.params.serverwidth,
			this.server_height = this.$route.params.serverwidth,
			sk.background('black');
			this.ballx = this.server_width / 2;
			this.bally = this.server_height / 2;
			this.ya = this.server_height / 2;
			this.yb = this.server_height / 2;

			this.rwidth = 10 * sk.width / 100;
			this.rheight = 70 * sk.height / 100;
			this.rv = 10;
		},
		draw(sk) {
			sk.resizeCanvas(sk.windowWidth / 10 * 8, sk.windowHeight / 10 * 8);
			sk.clear();
			sk.background('black');

			sk.stroke(sk.color(255, 255, 255));
			sk.strokeWeight(2);
			sk.fill(sk.color(0, 100, 150));
			sk.push();
			sk.translate(sk.width / 2 - sk.width / 8, (this.ya * sk.height / this.server_height));
			sk.box((5 * sk.width / this.server_width), (100 * sk.height / this.server_height), (5 * sk.width / this.server_width));
			sk.pop();

			sk.stroke(sk.color(255, 255, 255));
			sk.strokeWeight(2);
			sk.fill(sk.color(0, 100, 150));
			sk.push();
			sk.translate(-(sk.width / 2 - sk.width / 8), (this.yb * sk.height / this.server_height));
			sk.box((5 * sk.width / this.server_width), (100 * sk.height / this.server_height), (5 * sk.width / this.server_width));
			sk.pop();

			sk.stroke(sk.color(255, 255, 255));
			sk.strokeWeight(2);
			sk.fill(sk.color(0, 100, 150));
			sk.push();
			sk.translate(0, 0);
			sk.sphere(5)
			sk.pop();

			let key = 0;
			if (sk.keyIsDown(38) && !sk.keyIsDown(40))
				key = 38;
			else if (sk.keyIsDown(40) && !sk.keyIsDown(38))
				key = 40;
			if (key != 0)
				this.$root.connection.send(JSON.stringify({type: 'emit_key', content: { room_id: this.$route.query.room_id, user: this.$store.state.user, key: key }}));

			// sk.stroke('white');
			// sk.fill('white');

			// Draw PlayerA
			// sk.rect(this.rwidth, (this.ya * sk.height / this.server_height) - this.rheight / 2, this.rwidth, this.rheight);
			// Draw PlayerB
			// sk.rect((sk.width - (this.rwidth * 2)) - (this.rwidth / 2), (this.yb * sk.height / this.server_height) - this.rheight / 2, this.rwidth, this.rheight);

			// sk.ellipse(	this.ballx * sk.width / this.server_width,
			// 			this.bally * sk.height / this.server_height,
			// 			(this.ballr * sk.height / this.server_height),
			// 			(this.ballr * sk.height / this.server_height));
		},
	},
	created() {
		const self = this;

		if (this.$root == null || this.$root.connection == null) {
			this.$router.push({path: '/'});
			return ;
		}

		this.$root.connection.send(JSON.stringify({type: 'emit_checkid', content: { room_id: this.$route.query.room_id }}))
		this.$root.connection.onmessage = function(event) {
			const data = JSON.parse(event.data);
			if (data.type === "ack_loop") {
				self.scorea = data.content.sa;
				self.scoreb = data.content.sb;
			
				self.ballx = data.content.bx;
				self.bally = data.content.by;

				self.ya = data.content.pay;
				self.yb = data.content.pby;
			} else if (data.type === "ack_redirect") {
				console.log("redirect");
				this.$router.push({path: '/'});
				return ;
			}
		}
	},
};
</script>

<style>

</style>