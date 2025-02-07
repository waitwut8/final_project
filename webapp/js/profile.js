// SDK initialization





// Upload function internally uses the ImageKit.io javascript SDK
async function upload(data) {
    var ress = await api.get("/imagekit_public")
    var datas = ress.data
    var imagekit = new ImageKit({
        publicKey : datas[0],
        urlEndpoint : datas[1],


    });
    var res = await api.get("/imagekit_auth")
    var data = await res.data
    var token = data.token, expiration = data.expire, signature = data.signature;

    
    var file = document.getElementById("file1");
    await imagekit.upload({
        file: file.files[0],
        fileName: `profile-${$("#inputUsername").val()}`,
        folder: "profiles",
        tags: ["tag1"],
        token: token,
        signature: signature,
        expire: expiration,
      }, function(err, result) {
        console.log(err);
        console.log(result);
        api.post("/user/change_profile_pic", {'url': result.url});
      })

}
async function start_profile(){
    let res = await api.get("/user/whoami")
    let profile = res.data
    $("#inputUsername").attr('value', profile.username)
    $("#inputEmail").attr('value', profile.email)
    $("#inputFirst").attr('value', profile.first_name)
    $("#inputLast").attr('value', profile.last_name)
    $("#inputPhone").attr('value', profile.phone)
    let image = (await api.get("/user/get_profile_pic")).data
    $("#image").attr('src', image)

}
async function edit_profile(){
    let username = $("#inputUsername").val()
    let email = $("#inputEmail").val()
    let firstName = $("#inputFirst").val()
    let lastName = $("#inputLast").val()

    
    let res = await api.post("/user/edit_profile", {
        username: username,
        email: email,
        first_name: firstName,
        last_name: lastName,

    })
    if (res.status == 200){
        alert("Profile updated successfully")
    }
    else{
        alert("Error updating profile")
    }
}
function startup() {
    start_profile()
    $("#upload").on("click", function() {
        upload();
    });
    $("#save").on("click", function() {
        edit_profile();
    });
}
startup()
