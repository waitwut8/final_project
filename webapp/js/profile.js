// SDK initialization

var imagekit = new ImageKit({
    publicKey : "public_L9//JkW+LtC/4zR+2vz9oQb+y44=",
    urlEndpoint : "https://ik.imagekit.io/lab301x",

});



// Upload function internally uses the ImageKit.io javascript SDK
async function upload(data) {
    auth = await api.get("/get_auth_params")
    authData = auth.data
    var file = document.getElementById("file1");
    imagekit.upload({
        file: file.files[0],
        fileName: "abc.jpg",
        tags: ["tag1"],
        token: authData.token,
        signature: authData.signature,
        expire: authData.expire,
      }, function(err, result) {
        console.log(imagekit.url({
          src: result.url,
          transformation : [{ height: 300, width: 400}]
        }));
      })
}
async function start_profile(){
    let res = await api.get("/profile")
    let profile = res.data
    $("#inputUsername").attr('value', profile.username)
    $("#inputEmail").attr('value', profile.email)
    $("#inputFirst").attr('value', profile.firstName)
    $("#inputLast").attr('value', profile.lastName)
    $("#inputPhone").attr('value', profile.phone)
    $("#inputLocation").attr('value', profile.address.address)
    $("#inputBirthday").attr('value', profile.birthDate)
}
async function edit_profile(){
    let username = $("#inputUsername").val()
    let email = $("#inputEmail").val()
    let firstName = $("#inputFirst").val()
    let lastName = $("#inputLast").val()
    let phone = $("#inputPhone").val()
    let address = $("#inputLocation").val()
    let birthDate = $("#inputBirthday").val()
    
    let res = await api.post("/change_profile", {
        username: username,
        email: email,
        first: firstName,
        last: lastName,
        location: address,
        email: email,
        phone: phone,
        birthday: birthDate
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