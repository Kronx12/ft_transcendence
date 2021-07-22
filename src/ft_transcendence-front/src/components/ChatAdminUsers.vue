<template>
<div id="admin_body">
    <div @click="destroy_popup()" id="quit"><img src="../assets/close.svg" class="denied"></div>
    <h1 class="title">Users Administration Panel</h1>
    <hr>
    <div>
        <table>
            <tbody v-for="user in users_admins" :key="user" class="user-row">
                <tr>
                    <td>{{user.username }}</td>
                </tr>
            </tbody>
        </table>
        <form>
            <div class="form-section">
                <label for="name">name</label>
                <input ref="name" type="name" id="name" name="name" maxlength="10" required>
                <hr>
                <input ref="submit" @click.prevent="sendForm()" type="submit" name="submit" value="Add">
            </div>
        </form>
    </div>
    <div>
        <table>
            <tbody v-for="user in users" :key="user" class="user-row">
                <tr>
                    <td>{{user.username }}</td>
                </tr>
            </tbody>
        </table>
        <form>
            <div class="form-section">
                <label for="name">name</label>
                <input ref="name_2" type="name" id="name_2" name="name" maxlength="10" required>
                <hr>
                <input ref="submit_2" @click.prevent="sendForm()" type="submit" name="submit" value="Add">
            </div>
        </form>
    </div>
    <form>
        
    </form>
</div>
</template>

<script>
export default {
	props: ["id"],
    data() {
        return {
            users_admins: [],
            users: [],
        }
    },
    methods: {
		async activate() {
			var self = this;
			setTimeout(function() { self.refreshChat(); }, 1000);
		},
        sendForm() {
            console.log("SEND FORM:", this.method);
            this.destroy_popup();
        },
        destroy_popup() {
            this.$root.admin = 0;
        },
        getUsers() {
            var self = this;
            this.$store.dispatch("getUsersNotAdmin", this.id).then(function (result) {
                var _self = self;
                self.users_admins = result;
                if (self.users_admins.length > 0) {
                    // Get users
                    self.$store.dispatch("getUsersFromIds", self.users_admins).then(function (result) {
                        _self.users_admins = result;
                        console.log("ADMINS_USERS:", _self.users_admins);
                    });
                }
            });
            this.$store.dispatch("getUsersNotInCanal", this.id).then(function (result) {
                var _self = self;
                self.users = result;
                if (self.users.length > 0) {
                    // Get users
                    self.$store.dispatch("getUsersFromIds", self.users).then(function (result) {
                        _self.users = result;
                        console.log("USERS:", self.users);
                    });
                }
            });
        },
    },
    mounted() {
        const self = this;
		setInterval(function () {
            self.getUsers();
        }, 1000);
        this.$refs.submit.value = this.method;
    },
}
</script>

<style>
@import "./../assets/styles/chat_admin.css";
</style>