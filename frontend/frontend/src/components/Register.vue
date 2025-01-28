<script lang = "ts">
import { defineComponent, ref } from 'vue'
import api from '../plugins/api'

export default defineComponent({
    methods: {
        register(event){
            console.log(event)
            const user = event.srcElement[0].value
            const email = event.srcElement[1].value
            const pass = event.srcElement[2].value
            const first = event.srcElement[3].value
            const last = event.srcElement[4].value
            console.log(
                {
                username: user,
                email: email,
                password: pass,
                first_name: first,
                last_name: last,
                role: "USER",
            }
            )
            api.post("/user/add" , {
                username: user,
                email: email,
                password: pass,
                first_name: first,
                last_name: last,
                role: "USER",
            }).then((response) => {
                console.log(response)
            }).catch((error) => {
                console.log(error)
            })
        }
    }
})

</script>
<template>
    <div>
        <h1>Register</h1>
        <h2>Account Details</h2>
        <form @submit.prevent="register">
            <div>
                <label for="username">Username:</label>
                <input type="text" id="username"  required>
            </div>
            <div>
                <label for="email">Email:</label>
                <input type="email" id="email"  required>
            </div>
            <div>
                <label for="password">Password:</label>
                <input type="password" id="password"  required>
            </div>
            
        
        <hr>
        
        <div>
            <label for="firstname">First Name:</label>
            <input type="text" id="firstname"  required>
        </div>
        <div>
            <label for="lastname">Last Name:</label>
            <input type="text" id="lastname"  required>
        </div>
        <button>Register</button>
    </form>
        
    </div>
</template>