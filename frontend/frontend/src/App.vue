<script lang="ts">

import { defineComponent, ref } from 'vue'
// import axios from 'axios'
import api from './plugins/api'
import {AxiosInstance} from 'axios'


declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance

  }
}

export default defineComponent({
    methods: {
        login(event){
            const user = event.srcElement[0].value
            const pass = event.srcElement[1].value
            
            api.post("/user/login" , {
                username: user,
                password: pass
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

    <!-- <div class="text-center">
        <a name="" id="" class="btn btn-primary" href="register.html" role="button">Create a new account</a>

    </div> -->
</div>
</div>
</template>

