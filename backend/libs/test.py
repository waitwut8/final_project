from lib_sender import send_email, generic_email
template = generic_email({"username" : "test"}, "registration.html")
send_email("waitwut8@gmail.com", "waitwut8@gmail.com", "test", template)