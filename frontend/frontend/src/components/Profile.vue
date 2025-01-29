
<template>
    <div>
        <h1>Profile</h1>
        <h2>Account Details</h2>
        <form @submit.prevent="whoami">
            
            <div>
                <label for="email">Email:</label>
                <input type="email" id="email"  required>
            </div>
            <div>
                <label for="email">First Name:</label>
                <input type="text" id="first"  required>
            </div>
            <div>
                <label for="email">Last Name:</label>
                <input type="text" id="last"  required>
            </div>
            
            
        
        <hr>
        
        <div>
            <button type="submit">Submit</button>
        </div>
        </form>
    </div>
</template>
<script>
import { defineComponent, ref} from 'vue'
import api from '../plugins/api'


api.get("/user/whoami").then((res) => {
    console.log(res)
    let data = res.data
    console.log(data)

            document.getElementById("email").value = data.email

            document.getElementById("first").value = data.first_name
            document.getElementById("last").value = data.last_name
    
})
export default defineComponent({
    methods: {
         async whoami(event){
            let r = {

                email: document.getElementById("email").value,
                first_name: document.getElementById("first").value,
                last_name: document.getElementById("last").value,
                role: "USER"
            }
            console.log(r)
            let res = api.post("/user/edit_profile", r)
        }
    }

})
</script>
<style></style>