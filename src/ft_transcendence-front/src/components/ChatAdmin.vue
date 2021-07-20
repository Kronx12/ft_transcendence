<template>
<div id="admin_body">
    <div @click="destroy_popup()" id="quit"><img src="../assets/close.svg" class="denied"></div>
    <h1 class="title">Administration Panel</h1>
    <hr>
    <form>
        <div class="form-section">
            <label for="name">name</label>
            <input ref="name" type="name" id="name" name="name" maxlength="15" required>
            <hr>
            <label for="image">image</label>
            <input ref="image" type="url" id="image" name="image">
            <hr>
            <label class="important" for="visibility">Visibility:</label>
            <br>
            <input ref="visibility" v-model="visibility" @change="updatePassword()" type="radio" id="public" value="public" name="visibility" checked required>
            <label for="public">public</label>
            <br>
            <input ref="visibility" v-model="visibility" @change="updatePassword()" type="radio" id="private" value="private" name="visibility" required>
            <label for="private">private</label>
            <br>
            <input ref="visibility" v-model="visibility" @change="updatePassword()" type="radio" id="protected" value="protected" name="visibility" required>
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
            last_visibility: 0
        }
    },
    methods: {
        sendForm() {
            console.log("SEND FORM:", this.method);
            if (this.method == "create") {
                let canal = {
                    id: null,
                    name: this.$refs.name.value,
                    image: this.$refs.image.value,
                    owner: this.$root.$store.state.user.id,
                    users: String(this.$root.$store.state.user.id),
                    admins: String(this.$root.$store.state.user.id),
                    password: this.last_visibility == 1 ? this.$refs.password.value : "",
                    visibility: this.last_visibility,
                }
                console.log(this.$store.dispatch("createCanal", canal));
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
            this.$root.admin = false;
        }
    },
    mounted() {
        this.$refs.submit.value = this.method;
    }
}
</script>

<style>
@import "./../assets/styles/chat_admin.css";
</style>