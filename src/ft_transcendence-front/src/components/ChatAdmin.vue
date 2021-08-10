/* eslint-disable */
<template>
<div id="admin_body">
    <div @click="destroy_popup()" id="quit"><img src="../assets/close.svg" class="denied"></div>
    <h1 class="title">Administration Panel</h1>
    <hr>
    <form>
        <div class="form-section">
            <label for="name">name</label>
            <input ref="name" type="name" id="name" name="name" maxlength="10" required="required">
            <hr>
            <label class="important" for="visibility">Visibility:</label>
            <br>
            <input ref="visibility" v-model="visibility" @change="updatePassword()" type="radio" id="public" value="public" name="visibility" :checked="visibility == 0" required>
            <label for="public">public</label>
            <br>
            <input ref="visibility" v-model="visibility" @change="updatePassword()" type="radio" id="private" value="private" name="visibility" :checked="visibility == 1" required>
            <label for="private">private</label>
            <br>
            <input ref="visibility" v-model="visibility" @change="updatePassword()" type="radio" id="protected" value="protected" name="visibility" :checked="visibility == 2" required>
            <label for="protected">protected</label>
            <br>
            <div v-if="this.last_visibility == 1">
                <label for="password">password</label>
                <input ref="password" type="password" id="password" name="password" required>
            </div>
            <hr>
            <input ref="submit" @click.prevent="sendForm()" type="submit" name="submit" value="this.method">
        </div>
    </form>
</div>
</template>

<script>
export default {
	props: ["id", "method"],
    data() {
        return {
            last_visibility: 0,
            visibility: 0,
        }
    },
    methods: {
        sendForm() {
            //console.log("SEND FORM:", this.method);
            if (this.method == "create") {
                let canal = {
                    id: null,
                    name: this.$refs.name.value,
                    owner: this.$root.$store.state.user.id,
                    users: String(this.$root.$store.state.user.id),
                    logged: String(this.$root.$store.state.user.id),
                    admins: String(this.$root.$store.state.user.id),
                    password: this.last_visibility == 1 ? this.$refs.password.value : "",
                    visibility: this.last_visibility,
                }
                this.$store.dispatch("createCanal", canal);
                this.destroy_popup();
            } else if (this.method == "update") {
                let canal = {
                    id: this.id,
                    name: this.$refs.name.value,
                    owner: this.$root.$store.state.user.id,
                    users: String(this.$root.$store.state.user.id),
                    admins: String(this.$root.$store.state.user.id),
                    password: this.last_visibility == 1 ? this.$refs.password.value : "",
                    visibility: this.last_visibility,
                }
                this.$store.dispatch("updateCanal", canal);
                this.destroy_popup();
            }
        },
        async updatePassword(event) {
            if (this.visibility == "public")
                this.last_visibility = 0;
            else if (this.visibility == "protected")
                this.last_visibility = 1;
            else if (this.visibility == "private")
                this.last_visibility = 2;
        },
        destroy_popup() {
            this.$root.admin = 0;
        },
    },
    mounted() {
        this.$refs.submit.value = this.method;
        if (this.method == "update") {
            this.$store.dispatch("getCanalById", this.id).then(canal => {
                canal = canal[0];
                this.$refs.name.value = canal.name;
                this.visibility = canal.visibility;
                if (canal.visibility == 1)
                    this.$refs.password.value = canal.password;
            });
        }
    },
}
</script>

<style>
@import "./../assets/styles/chat_admin.css";
</style>