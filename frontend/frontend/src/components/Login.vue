<script lang="ts">

import { defineComponent, ref } from 'vue'
// import axios from 'axios'
import api from '../plugins/api'
import type { AxiosInstance } from 'axios';


declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance

  }
}

export default defineComponent({
    methods: {
        login(event: { srcElement: { value: any; }[]; }){
            const user = event.srcElement[0].value
            const pass = event.srcElement[1].value
            
            api.post("/user/login" , {
                username: user,
                password: pass
            }).then((response) => {
                console.log(response)
                localStorage.setItem("token", response.data.access_token)
                localStorage.setItem("refresh", response.data.refresh_token)
                
                
            })
            
        },
        redirect(path: string){
            this.$router.push(path).then(()=>{
                
                this.$router.go(0)
            })
        }
    }
})
</script>

<template>
    <div id = "login">
  <i class="fa-duotone  fa-lock fa-xl" style="font-size: 14rem"></i>

<div class="login-container mx-5">
    <h2>Login</h2>
    <form id="loginform" @submit.prevent="login">

        <input type="text" name="username" placeholder="Username" required id = "user">
        <input type="password" name="password" placeholder="Password" required id = "pass">
        <button type="submit">Login</button>
    </form>
    <div class="text-center mt-3">
        <a href="#">Forgot your password?</a>
    </div>

    <hr>

    <div class="text-center">
        <!-- <router-link to = "/register">Register</router-link> -->
         <button @click = "redirect('/profile')">See your profile</button>
        <!-- <router-link to = "/profile">See your profile</router-link> -->
    </div>
    <router-view></router-view>
</div>
</div>
</template>

