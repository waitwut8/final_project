function login(form) {
    form.addEventListener("submit", async (e) => {
      let r = {
        username: form.username.value,
        password: form.password.value,
      };
      console.log(r);
      e.preventDefault();

       try{ 
      let res = await axios.post(`${api_url}/user/login`, r);
      
      let s = await res.data;
  
      let token = s["access_token"],
        r_token = s["refresh_token"];
  
      localStorage.setItem("access_token", token);
      localStorage.setItem("refresh_token", r_token);
      localStorage.setItem("user_name", r.username)
      if (res.status === 200) {
        localStorage.setItem("logged_in", "true")
        
        role = res.data.role
        console.log(role.toLowerCase())
        if (role.toLowerCase() == "admin"){
          window.location.href = "admin_index.html"
        }
        else{
          window.location.href = "index.html"
        }
        
        
      } 
    }
    catch(e){
        console.log(e)
        if (e.status === 403){
            $(`#disabled_account`).removeClass("hidden").addClass("pop-in");

            setTimeout(() => {
                $(`#disabled_account`).removeClass("pop-in").addClass("fade-out");
            }, 12000);

            $(`#disabled_account`).removeClass("fade-out").addClass("hidden");
            return 0;
        }
      $(`#wrong_credentials`).removeClass("hidden").addClass("pop-in");

        setTimeout(() => {
            $(`#wrong_credentials`).removeClass("pop-in").addClass("fade-out");
        }, 12000);

        $(`#wrong_credentials`).removeClass("fade-out").addClass("hidden");
    }
    });
  }