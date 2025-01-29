<script lang="ts">
import { defineComponent, ref } from 'vue'
import api from '../plugins/api'


export default defineComponent({
    data(){
        return {
            users: []
        }
    },
    methods: {
        async getUsers(){
            let res = await api.get("/user/")
            this.users = res.data
            
        },
        async disableUser(id){
            let res = await api.post("/user/disable", {"user_id": id})
            this.getUsers()
            this.$router.go(0)
        },
        async deleteUser(id){
            let r = {"user_id": id}
            let res = await api.delete(`/user/delete`, {data: r})
            console.log(res)
            this.getUsers()
            // this.$router.go(0)
        },
        
    },
    mounted(){
        this.getUsers()
    }
})
</script>
<script setup lang="ts">

</script>
<template>
    <div>
        <h1>User Management</h1>
        <div
            class="table-responsive"
        >
            <table
                class="table table-primary table-striped table-hover"
            >
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Is Active</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="user in users" :key="user.id">
                    <td><input type="text">{{ user.id }}</input></td>
                    <td>{{ user.first_name + ", "+user.last_name }}</td>
                    <td>{{ user.email }}</td>
                    <td>{{ user.role }}</td>
                    <td>{{ user.active }}</td>
                    <td>
                        
                        <button
                            type="button"
                            class="btn btn-danger"
                            @click="deleteUser(user.id)"
                        >
                            Delete User
                        </button>
                        
                        
                        <button
                            type="button"
                            class="btn btn-danger"
                            @click="disableUser(user.id)"
                        >
                            Disable
                        </button>
                        
                    </td>
                </tr>
                </tbody>
            </table>
        </div>
        
    </div>


</template>

<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">

