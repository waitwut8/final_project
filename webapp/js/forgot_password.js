async function handleEmailSend(){
    let data = await api.post('/user/send_reset_code', {'username': $('#username').val()})
    console.log(data)
    if (data.status==200){
        popup('emailSent')
    }
    else{
        popup('emailError')
    }
}
async function handleCodeConfirm(){
    try{
    let data = await api.post('/user/reset_password', {
        'username': $('#username').val(),
        'code': $('#code').val(),
        'password': $('#newPassword').val()
    })
    console.log(data)
    if (data.status==200){
        popup('passwordReset')
    }
    else{
        popup('errorPassword')
    }
}
    catch (error) {
        console.error('Error:', error);
        popup('errorPassword')
    }
}
function popup(identifier){
    $(`#${identifier}`).removeClass("hidden").addClass("pop-in");
    setTimeout(() => {
        $(`#${identifier}`).removeClass("pop-in").addClass("fade-out");
    }, 12000);
    $(`#${identifier}`).removeClass("fade-out").addClass("hidden");
}
$("#resetPassword").on('click', async (e)=>{e.preventDefault();handleCodeConfirm();})
$("#sendEmail").on('click', async (e)=>{e.preventDefault();handleEmailSend();})