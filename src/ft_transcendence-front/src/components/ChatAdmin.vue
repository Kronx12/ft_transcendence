<template>
<div id="admin_body">
    <h1 class="title">Administration Panel</h1>
    <hr>
    <form @submit="sendForm()">
        <div class="form-section">
            <label class="important" for="visibility">Visibility:</label>
            <input type="radio" id="private" value="private" name="visibility" required>
            <label for="private">private</label>

            <input type="radio" id="protected" value="protected" name="visibility" required>
            <label for="protected">protected</label>

            <input type="radio" id="public" value="public" name="visibility" required>
            <label for="public">public</label>
        </div>
        <hr>
    </form>
</div>
</template>

<script>
export default {
	props: ["id", "method"],
    data() {
        return {

        }
    },
    methods: {
        sendForm() {

        }
    }
}
</script>

<style>
@import "./../assets/styles/chat_admin.css";
</style>