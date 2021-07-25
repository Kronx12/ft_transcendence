/* eslint-disable */
<template>
<div id="admin_body">
    <div @click="destroy_popup()" id="quit"><img src="../assets/close.svg" class="denied"></div>
    <h1 class="title">Users Administration Panel</h1>
    <hr>
    <div class="container">
        <h3>Admins</h3>
        <div class="table">
            <table>
                <thead>
                    <tr>
                        <th>Username</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="user in users_admins_actual" :key="user">
                        <td>{{user.username}}</td>
                        <td><button @click.prevent="del_admin(user.intra_id)" class="del-button">x</button></td>
                        <td><button @click.prevent="mute_user(user.intra_id)">MUTE</button></td>
                    </tr>
                </tbody>
            </table>    
        </div>
        <form>
            <div class="form-section vertical-center">
                <div class="box">
                    <select ref="admin_select" name="users" id="admin-select" class="user-row">
                        <option v-for="user in users_admins" :key="user.intra_id" :value="user.intra_id">{{user.username}}</option>
                    </select>
                </div>
                <button @click.prevent="add_admin()" class="add-button"></button>
            </div>
        </form>
    </div>

    <div class="container">
        <h3>Users</h3>
        <div class="table">
            <table>
                <thead>
                    <tr>
                        <th>Username</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="user in users_actual" :key="user">
                        <td>{{user.username}}</td>
                        <td><button @click.prevent="del_user(user.intra_id)" class="del-button">x</button></td>
                    </tr>
                </tbody>
            </table>
        </div>  
        <form>
            <div class="form-section vertical-center">
                <div class="box">
                    <select ref="user_select" name="users" id="user-select" class="user-row">
                        <option v-for="user in users" :key="user.intra_id" :value="user.intra_id">{{user.username}}</option>
                    </select>
                </div>
                <button @click.prevent="add_user()" class="add-button"></button>
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
            users_admins_actual: [],
            users_actual: [],
        }
    },
    methods: {
		async activate() {
			var self = this;
			setTimeout(function() { self.refreshChat(); }, 1000);
		},
        add_admin() {
            var self = this;
            console.log("ADD ADMIN:", this.$refs.admin_select.value);
            if (this.$refs.admin_select.value != "") {
                this.$store.dispatch("addAdminUserId", {canal_id: this.id, id: this.$refs.admin_select.value}).then(function(response) {
                    self.getUsers();
                });
            }
        },
        add_user() {
            var self = this;
            console.log("ADD USER:", this.$refs.user_select.value);
            if (this.$refs.user_select.value != "") {
                this.$store.dispatch("addUserId", {canal_id: this.id, id: this.$refs.user_select.value}).then(function(response) {
                    self.getUsers();
                });
            }
        },
        del_admin(id) {
            var self = this;
            console.log("DEL ADMIN:", id);
            this.$store.dispatch("delAdminUserId", {canal_id: this.id, id: id}).then(function(response) {
                self.getUsers();
            });
        },
        del_user(id) {
            var self = this;
            console.log("DEL USER:", id);
            this.$store.dispatch("delUserId", {canal_id: this.id, id: id}).then(function(response) {
                self.getUsers();
            });
        },
        mute_user(id) {
            var self = this;
            const date = new Date().getTime();
            self.$store.dispatch("muteUserIdTime", {id: id, canalid: self.id, time: date + 60000 * 60}).then(function (response) {
                console.log(id + " has been muted for 1 hour from " + self.id + " channel");
            })
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
                        console.log("USERS:", _self.users);
                    });
                }
            });
            this.$store.dispatch("getCanalById", this.id).then(function (result) {
                var _self = self;
                console.log("CANAL:", result);                
                self.users_actual = self.deserialize(result[0].users);
                self.users_admins_actual = self.deserialize(result[0].admins);

                if (self.users_actual.length > 0) {
                    // Get users actual
                    self.$store.dispatch("getUsersFromIds", self.users_actual).then(function (result_here) {
                        _self.users_actual = result_here;
                        console.log("ACTUAL USERS:", _self.users_actual);
                    });
                }
                
                if (self.users_admins_actual.length > 0) {
                    // Get users admins actual
                    self.$store.dispatch("getUsersFromIds", self.users_admins_actual).then(function (result_here) {
                        _self.users_admins_actual = result_here;
                        console.log("ACTUAL USERS:", _self.users_admins_actual);
                    });
                }
            });
        },
        deserialize(str) {
            return str.split(':').map(x=>+x);
        },
    },
    mounted() {
        const self = this;
        this.getUsers();
		// setInterval(function () {
        //     self.getUsers();
        // }, 1000);
    },
}
</script>

<style>
@import "./../assets/styles/chat_admin.css";
</style>