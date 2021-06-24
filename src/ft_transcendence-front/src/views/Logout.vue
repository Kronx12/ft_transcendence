<script>

export default {
    mounted: function() {
        this.$store.state.user.id = -1
        this.$store.state.user.login = ""
        this.$store.state.status = ''
        localStorage.setItem('jwtToken', '')
        
        this.$router.push('/')
    },
}
</script>