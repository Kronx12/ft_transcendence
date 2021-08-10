<template>
    <div>
        <div class="body">
            <div class="section-left">
                <img v-if="this.$root.$store.state.user.id == this.receiver.id" :src="this.transmitter.avatarURL">
                <img v-else-if="this.$root.$store.state.user.id == this.transmitter.id" :src="this.receiver.avatarURL">
            </div>
            <div class="section-right">
                <p v-if="this.$root.$store.state.user.id == this.receiver.id" class="type">{{ this.type ? "BONUS" : "NORMAL" }}</p>
                <p v-else class="type">Pending...</p>
                <div v-if="this.$root.$store.state.user.id == this.receiver.id" @click="accept()"><img src="../assets/right.svg" class="accept"></div>
                <div v-if="this.$root.$store.state.user.id == this.receiver.id" @click="decline()"><img src="../assets/close.svg" class="denied"></div>
            </div>
        </div>
        <div class="arrow-right"></div>
    </div>
</template>

<script>
export default {
    props: ['type', 'transmitter', 'receiver'],
    methods: {
        accept() {
            this.$root.connection.send(JSON.stringify({type: 'accept_invite', content: { type: this.type, transmitter: this.transmitter.id, receiver: this.receiver.id }}));
        },
        decline() {
            this.$root.connection.send(JSON.stringify({type: 'decline_invite', content: { type: this.type, transmitter: this.transmitter.id, receiver: this.receiver.id }}));
        }
    },
    created: function () {
        //console.log('user data from parent component:')
        //console.log(this.type)
        //console.log('transmitter:')
        //console.log(this.transmitter)
        //console.log('receiver:')
        //console.log(this.receiver)
        //console.log('user:')
        //console.log(this.$root.$store.state.user)
    },
}
</script>

<style>
@import '../assets/styles/invitation.css';
</style>