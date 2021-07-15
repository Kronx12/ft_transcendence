<script>

export default {
    mounted: async function() {
        await this.$store.dispatch("editStatus", {id: this.$store.state.user.id, status: 0})
        this.$store.state.user.id = -1
        this.$store.state.user.login = ""
        this.$store.state.status = ''
        localStorage.setItem('jwtToken', '')
        
        this.$router.push('/')
    },
}
</script>