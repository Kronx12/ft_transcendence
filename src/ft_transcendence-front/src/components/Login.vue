<template>
    <div>
        <div v-if="auth">
            <label>2FA Verification code: </label><br>
            <input type="text" id="verif_qr" v-model="validation"><br>
              <label v-if="incorrect" style="color: red;">Incorrect !</label><br v-if="incorrect">
            <button @click="validate()" >Pair the account</button>
        </div>
        <div v-else-if="status == 'error'">
            <h1>Connection error</h1>
            <button @click="connect">Connect with 42 Intra</button>
        </div>
        <div v-else-if="status == 'loading'">
            <img  src="https://cdn.shopify.com/s/files/1/0163/4078/t/96/assets/progressring.gif" />
        </div>

        <div v-else>
            <button @click="connect">Connect with 42 Intra</button>
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
            hoverimage: 0,
            auth: false,
            incorrect: false,
            validation: "",
            secret: ""
        }
    },
    computed: {
        ...mapState(['status'])
    },
    methods: {
        hoverimageMouse: function(){
            this.hoverimage = !this.hoverimage;
        },
        tryLogin: function(code) {
            const self = this;
            this.$store.dispatch('getToken', code)
            .then(function(response) {
                 self.tokenAuth(localStorage.getItem("ft_token"))
            })
            .catch(function(error) {
                self.login = "Error"
            });
        },
        tokenAuth: async function(token) {
            const self = this;
            await this.$store.dispatch('getLogin', token)
            .then(function(response) {
                console.log("2", response)
                if (response.auth)
                {
                        self.auth = true;
                        self.secret = response.secret;
                }
                else {
                self.picture = self.$store.state.user.avatarURL;
                localStorage.setItem('ft_token', '')
                }
                
            })
            .catch(function(error) {
                console.log(error)
                self.connect();
            });
        },
        connect: function()
        {
            this.$store.dispatch('waitIntra')
            window.location.href = "https://api.intra.42.fr/oauth/authorize?client_id=24505a193a1387501b4477352c3a949680f317d28f3354226ed21b6f294d3f13&redirect_uri=http%3A%2F%2Flocalhost%3A8080%2Flogin%2F&response_type=code";
        },
        validate: async function() {
        const self = this;
        await this.$store.dispatch("validate", {secret: this.secret, code: this.validation}).then(async function(result) {
        console.log(result.data);
        if (result.data == "False")
            self.incorrect = true;
        else
        {
            self.incorrect = false;
            self.auth = false;
            await self.$store.dispatch('authLogin', localStorage.getItem("ft_token"))
            localStorage.setItem('ft_token', '')
        }
        })
        }
    },
    mounted() {
        if(this.$store.state.user.id == -1)
        {
            if (this.$route.query.code)
            {
                this.$store.dispatch('waitIntra')
                this.tryLogin(this.$route.query.code)
            }
            if(localStorage.getItem("ft_token") != "")
                this.tokenAuth(localStorage.getItem("ft_token"))
        }
    },
    updated() {
        this.$nextTick(function () {
            if (this.$store.state.user.id != -1)
                this.$router.push({path: "/"});
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