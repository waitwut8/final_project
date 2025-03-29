function register(){
    $("#register").on("click", async function(event){
        
            event.preventDefault()
            console.log("Registering")
            // Get the values from the form fields
            const username = $("#username").val(), email = $("#email").val(), password = $("#password").val(), first = $("#first").val(), last = $("#last").val();
            // Send a POST request to the server
            let res = await api.post("/user/add", {
                username: username,
                email: email,
                password: password,
                first_name: first,
                last_name: last,
                active: true,
            })
            
            // If the response is successful, alert the user
            if (res.status == 200){
                alert("Registration successful")
                window.location.href = "login.html"
            }
            else{
                alert("Error registering")
            }
        
    })
}
register()