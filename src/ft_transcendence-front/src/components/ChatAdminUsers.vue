/* eslint-disable */
<template>
  <div id="admin_body">
    <div @click="destroy_popup()" id="quit">
      <img src="../assets/close.svg" class="denied" />
    </div>
    <h1 class="title">Users Administration Panel</h1>
    <h6 style="color: red">{{ banMessage }}</h6>
    <hr />
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
              <td>{{ user.username }}</td>
              <td>
                <button
                  @click.prevent="del_admin(user.intra_id)"
                  class="del-button"
                >
                  X
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <form>
        <div class="form-section vertical-center">
          <div class="box">
            <select
              ref="admin_select"
              name="users"
              id="admin-select"
              class="user-row"
            >
              <option
                v-for="user in users_admins"
                :key="user"
                :value="user.intra_id"
              >
                {{ user.username }}
              </option>
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
              <td>{{ user.username }}</td>
              <td>
                <button
                  @click.prevent="del_user(user.intra_id)"
                  class="del-button"
                >
                  X
                </button>
              </td>
              <td>
                <div>
                  <img
                    @click.prevent="mute_temp_user(user.intra_id)"
                    src="../assets/mute.svg"
                    class="mute-button"
                  />
                </div>
              </td>
              <td>
                <div>
                  <img
                    @click.prevent="ban_temp_user(user.intra_id)"
                    src="../assets/sandglass.svg"
                    class="mute-button"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <form>
        <div class="form-section vertical-center">
          <div class="box">
            <select
              ref="user_select"
              name="users"
              id="user-select"
              class="user-row"
            >
              <option v-for="user in users" :key="user" :value="user.intra_id">
                {{ user.username }}
              </option>
            </select>
          </div>
          <button @click.prevent="add_user()" class="add-button"></button>
        </div>
      </form>
    </div>
    <form></form>
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
      canal: null,
      banMessage: "",
    };
  },
  methods: {
    async add_admin() {
      var self = this;
      console.log("ADD ADMIN:", this.$refs.admin_select.value);
      if (this.$refs.admin_select.value != "") {
        await this.$store.dispatch("addAdminUserId", {
          canal_id: this.id,
          id: this.$refs.admin_select.value,
        }).then(async () => {
            await self.getUsers();
        })
        
      }
      self.getUsers();
    },
    async add_user() {
      var self = this;
      console.log("ADD USER:", this.$refs.user_select.value);
      if (this.$refs.user_select.value != "") {
        await this.$store.dispatch("addUserId", {
          canal_id: this.id,
          id: this.$refs.user_select.value,
        }).then(async () => {
            await self.getUsers();
        })
      }
      self.getUsers();
    },
    async del_admin(id) {
      var self = this;
      console.log("DEL ADMIN:", id);
      await this.$store.dispatch("delAdminUserId", { canal_id: this.id, id: id }).then(async () => {
            await self.getUsers();
        })
        self.getUsers();
    },
    async del_user(id) {
      var self = this;
      console.log("DEL USER:", id);
      await this.$store.dispatch("delUserId", { canal_id: this.id, id: id }).then(async () => {
            await self.getUsers();
        })
        self.getUsers();
    },
    mute_temp_user: function (id) {
      var self = this;
      const date = new Date().getTime();
      self.$store
        .dispatch("muteUserIdTime", {
          id: id,
          canalid: self.id,
          time: date + 60000 * 60,
        })
        .then(function (response) {
          console.log(
            id + " has been muted for 1 hour from " + self.id + " channel"
          );
          self.banMessage =
            id + " has been banned for 1 hour from " + self.id + " channel";
          setTimeout(function () {
            self.banMessage = "";
          }, 5000);
        });
    },
    ban_temp_user(id) {
      var self = this;
      const date = new Date().getTime();
      self.$store
        .dispatch("banUserIdTime", {
          id: id,
          canalid: self.id,
          time: date + 60000 * 60,
        })
        .then(function (response) {
          console.log(
            id + " has been banned for 1 hour from " + self.id + " channel"
          );
          self.banMessage =
            id + " has been banned for 1 hour from " + self.id + " channel";
          self.del_user(id);
        });
    },
    destroy_popup() {
      this.$root.admin = 0;
      clearInterval(this.inte)
    },
    async getUsers() {
      var self = this;
      await self.$store
        .dispatch("getUsersNotAdmin", self.id)
        .then(async function (result) {
          var _self = self;
          self.users_admins = result;
          console.log("ADMINS:");
          console.log(self.users_admins);
          if (self.users_admins.length > 0) {
            // Get users
            await self.$store
              .dispatch("getUsersFromIds", self.users_admins)
              .then(function (result) {
                _self.users_admins = result;
                console.log("ADMINS_USERS:", _self.users_admins);
              });
          }
        });
      await self.$store
        .dispatch("getUsersNotInCanal", self.id)
        .then(async function (result) {
          var _self = self;
          self.users = result;
          console.log("Not in channel");
          console.log(result);
          if (self.users.length > 0) {
            // Get users
            await self.$store
              .dispatch("getUsersFromIds", self.users)
              .then(function (result) {
                _self.users = result;
                console.log("USERS:", _self.users);
              });
          }
        });
      await self.$store
        .dispatch("getCanalById", self.id)
        .then(async function (result) {
          var _self = self;
          self.canal = result[0];
          console.log("CANAL:", self.canal);
          self.users_actual = self.deserialize(result[0].users);
          self.users_admins_actual = self.deserialize(result[0].admins);

          if (self.users_actual.length > 0) {
            // Get users actual
            await self.$store
              .dispatch("getUsersFromIds", self.users_actual)
              .then(function (result_here) {
                _self.users_actual = result_here;
                console.log("ACTUAL USERS:", _self.users_actual);
              });
          }

          if (self.users_admins_actual.length > 0) {
            // Get users admins actual
            self.$store
              .dispatch("getUsersFromIds", self.users_admins_actual)
              .then(function (result_here) {
                _self.users_admins_actual = result_here;
                console.log("ACTUAL ADMINS USERS:", _self.users_admins_actual);
              });
          }
        });
    },
    deserialize(str) {
      return str.split(":").map((x) => +x);
    },
  },
  mounted() {

    this.getUsers();
  },
};
</script>

<style>
@import "./../assets/styles/chat_admin.css";
</style>
