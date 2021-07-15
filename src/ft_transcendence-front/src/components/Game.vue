<template>
	<vue-p5 v-on="{ setup, draw }"></vue-p5>
</template>

<script>
import VueP5 from 'vue-p5';

export default {
	data() {
		return {
			vx: 1,
			vy: 1,
			xa: 0,
			ya: 0,
			xb: 0,
			yb: 0,
			server_width: 0,
			server_height: 0,
			ballx: 0,
			bally: 0,
			ballr: 15,
			rwidth: 0,
			rheight: 0,
			scorea: 0,
			scoreb: 0,
			start: false,
			end: false,
			win: {},
			start_chrono: 0,
			fontBold: null,
			isA: false,
			isB: false,
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
			sk.resizeCanvas(sk.windowWidth / 10 * 8, sk.windowHeight / 10 * 8);
			sk.clear();
			sk.background('black');

			if (!this.start && !this.end) {
				sk.fill('white');
				sk.textSize(32);
				sk.textAlign(sk.CENTER, sk.CENTER);
				let tmp = Math.ceil(this.start_chrono/1000);
				sk.text(tmp, sk.width / 2, sk.height / 10 * 3);
			} else if (!this.start) {
				sk.fill('white');
				sk.textSize(50);
				sk.textAlign(sk.CENTER, sk.CENTER);
				sk.text(this.win.login + " won !", sk.width / 2, sk.height / 2);
			} else {
				this.linedash(sk, sk.width / 2, 0, sk.width / 2, sk.height, 10, '_');

				sk.fill('white');
				sk.textSize(50);
				sk.textAlign(sk.CENTER, sk.CENTER);
				sk.text(this.scorea, sk.width / 2 - 100, sk.height / 20 * 3);
				sk.text(this.scoreb, sk.width / 2 + 100, sk.height / 20 * 3);

				let key = 0;
				if (sk.keyIsDown(38) && !sk.keyIsDown(40))
					key = 38;
				else if (sk.keyIsDown(40) && !sk.keyIsDown(38))
					key = 40;
				if (key != 0 && (this.isA || this.isB))
					this.$root.connection.send(JSON.stringify({type: 'emit_key', content: { room_id: this.$route.query.room_id, user: this.$store.state.user, key: key }}));


				sk.stroke('white');
				sk.fill('white');
				
				if (this.isA) {
					sk.stroke(0, 150, 200);
					sk.fill(0, 150, 200);
				} else {
					sk.stroke('white');
					sk.fill('white');
				}

				// Draw PlayerA
				sk.rect((this.xa * sk.width / this.server_width),
						(this.ya * sk.height / this.server_height),
						(this.rwidth * sk.width / this.server_width),
						(this.rheight * sk.height / this.server_height));

				if (this.isB) {
					sk.stroke(0, 150, 200);
					sk.fill(0, 150, 200);
				} else {
					sk.stroke('white');
					sk.fill('white');
				}

				// Draw PlayerB
				sk.rect((this.xb * sk.width / this.server_width),
						(this.yb * sk.height / this.server_height),
						(this.rwidth * sk.width / this.server_width),
						(this.rheight * sk.height / this.server_height));

				sk.stroke('white');
				sk.fill('white');
				sk.ellipse(	this.ballx * sk.width / this.server_width,
							this.bally * sk.height / this.server_height,
							(this.ballr * sk.height / this.server_height),
							(this.ballr * sk.height / this.server_height));
			}
		},
		linedash(sk, x1, y1, x2, y2, delta, style = '-') {
			let distance = sk.dist(x1,y1,x2,y2);
			let dashNumber = distance/delta;
			let xDelta = (x2-x1)/dashNumber;
			let yDelta = (y2-y1)/dashNumber;

			for (let i = 0; i < dashNumber; i+= 2) {
				let xi1 = i*xDelta + x1;
				let yi1 = i*yDelta + y1;
				let xi2 = (i+1)*xDelta + x1;
				let yi2 = (i+1)*yDelta + y1;

				if (style == '-') { sk.line(xi1 - (delta / 2), yi1, xi2 - (delta / 2), yi2); }
				else if (style == '.') { sk.point(xi1 - (delta / 2), yi1); }
				else if (style == 'o') { sk.ellipse(xi1 - (delta / 2), yi1, delta/2); }
				else if (style == '_') { sk.square(xi1 - (delta / 2), yi1, delta/2); }
			}
		},
		waitForSocketConnection(socket, callback) {
			const self = this
			setTimeout(
				function () {
					if (socket.readyState === 1) {
						console.log("Connection is made")
						if (callback != null){
							callback();
						}
					} else {
						console.log("wait for connection...")
						self.waitForSocketConnection(socket, callback);
					}

				}, 5);
		}
	},
	async created() {
		const self = this;
		await this.$store.dispatch("editStatus", {id: this.$store.state.user.id, status: 2})
		if (this.$root == null || this.$root.connection == null) {
			this.$router.push({path: '/'});
			return ;
		}
		self.waitForSocketConnection(self.$root.connection, function() {
			self.$root.connection.send(JSON.stringify({type: 'emit_checkid', content: { room_id: self.$route.query.room_id }}));
			console.log("EMIT CHECK CLIENT SIDE")
		});
		self.$root.connection.onmessage = function(event) {
			const data = JSON.parse(event.data);
			if (data.type === "ack_loop" && data.content.room_id == self.$route.query.room_id) {
				self.scorea = data.content.sa;
				self.scoreb = data.content.sb;
			
				self.ballx = data.content.bx;
				self.bally = data.content.by;

				self.rwidth = data.content.rw;
				self.rheight = data.content.rh;

				self.server_width = data.content.server_width,
				self.server_height = data.content.server_height,

				self.xa = data.content.pax;
				self.ya = data.content.pay;

				self.xb = data.content.pbx;
				self.yb = data.content.pby;

				self.start = data.content.start;
				self.start_chrono = data.content.start_chrono;
				self.end = data.content.end;
				self.win = data.content.win;
				
				self.isA = data.content.isA;
				self.isB = data.content.isB;
			} else if (data.type === "ack_redirect") {
				console.log("redirect");
				self.$router.push({path: '/'});
				return ;
			} else if (data.type === "ack_leave" && data.content.room_id == self.$route.query.room_id) {
				console.log("redirect");
				self.$router.push({path: '/'});
				return ;
			}
		}
	},
};
</script>

<style>

</style>