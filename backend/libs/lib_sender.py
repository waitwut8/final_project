import smtplib, ssl
from dotenv import load_dotenv
from os import getenv
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from jinja2 import Environment, FileSystemLoader


def send_email(sender, receiver, subject, message):
    host = "email-smtp.ap-southeast-2.amazonaws.com"
    

    load_dotenv(override=True)
    username = getenv("SMTP_USER")
    password = getenv("SMTP_PASS")
    print(username, password)
    port = 587

    context = ssl.SSLContext(ssl.PROTOCOL_TLSv1_2)
    message_body = MIMEMultipart("alternative")
    message_body["Subject"] = subject
    message_body["From"] = sender
    message_body["To"] = receiver

#     html = f"""\
# {message}
# """
    html = message
    html_part = MIMEText(html, "html")
    message_body.attach(html_part) 
    # try:
    with smtplib.SMTP(host=host, port=port) as server:
        server.starttls(context=context) 
        server.login(user=username, password=password)
        
        resp = server.sendmail(
            from_addr=sender, 
            to_addrs=receiver, 
            msg=message_body.as_string()
            )
        print(resp)
            
            
        
    # except Exception as e:
    #     print(e)

def generic_email(context, template):
    loader = FileSystemLoader("libs/templates")
    environment = Environment(loader=loader)
    
    template = environment.get_template(template)
    
    return template.render(context)