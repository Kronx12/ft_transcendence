<template>
    <div>
        <h1>Connected as {{ this.$store.state.user.login }}</h1>
        <div class="container">
            <img @click="goSettings()" @mouseenter="hoverimageMouse()" @mouseout="hoverimageMouse()" v-if="picture != ''" id="avatar-profile" v-bind:src=picture />
            <div @click="goSettings()"  class="hoverImage" v-if="hoverimage">Edit Avatar</div>
        </div>
        <div id="stats">
            <h1>Stats</h1>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex';
export default({
    data () {
        return {
            login : '',
            picture : '',
            hoverimage: 0
        }
    },
    computed: {
        ...mapState(['status'])
    },
    methods: {
        hoverimageMouse: function(){
            this.hoverimage = !this.hoverimage;
        },
        goSettings: function() {
            this.$router.push("/settings")
        }
    },
    mounted() {
        if (this.$store.state.user.id == -1)
                this.$router.push({path: "/login"});
            this.login = this.$store.state.user.login
            this.picture = this.$store.state.user.avatarURL
    },
    updated() {
        this.$nextTick(function () {
            if (this.$store.state.user.id == -1)
                this.$router.push({path: "/login"});
        })
    },
})

</script>

<style>
#stats {
    margin-top: 50px;
    /* border: 2px solid black; */
    display: flex;
	align-items: center;
	justify-content: center;
}
#avatar-profile {
    cursor: pointer;
}

#avatar-profile:hover {
    filter: blur(2px);
  -webkit-filter: blur(2px);
}
.container {
  position: relative;
}
.hoverImage {
  position: absolute;
  top: 75px;
  right: 600px;
  font-weight: 600;

  color: white;
  padding-left: 20px;
  padding-right: 20px;
}
</style>