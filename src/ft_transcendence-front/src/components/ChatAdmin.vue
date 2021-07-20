<template>
<div id="admin_body">
    <div @click="destroy_popup()" id="quit"><img src="../assets/close.svg" class="denied"></div>
    <h1 class="title">Administration Panel</h1>
    <hr>
    <form>
        <div class="form-section">
            <label for="name">name</label>
            <input ref="name" type="name" id="name" name="name" required>
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
            <div v-if="show_password">
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
        return { show_password: false }
    },
    methods: {
        sendForm() {
            console.log("SEND FORM:", this.method);
            if (this.method == "create") {
                let chat = {
                    name: this.$refs.name.value,
                    owner: this.$root.$store.state.user.id,
                    visibility: this.$refs.visibility.value,
                    password: (this.$refs.visibility.value == "protected") ? this.$refs.password.value : "",
                }
                this.$store.dispatch("createChat", chat);
                this.destroy_popup();
            }
        },
        async updatePassword(event) {
            this.show_password = (this.visibility == "protected");
            console.log(this.show_password);
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