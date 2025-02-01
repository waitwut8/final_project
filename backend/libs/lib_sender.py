import smtplib, ssl
from dotenv import load_dotenv
from os import getenv
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from jinja2 import Environment, FileSystemLoader

load_dotenv()
def send_email(sender, receiver, subject, message):
    host = "email-smtp.ap-southeast-2.amazonaws.com"
    print(host)
    
    username = "AKIAX6RQQILB7VE544HX"
    password = "BMk4woYMLmJqxacp2mpD1JGAuqTQQrOKo65DPEkJod4o"
    port = 25

    context = ssl.SSLContext(ssl.PROTOCOL_TLSv1_2)
    message_body = MIMEMultipart("alternative")
    message_body["Subject"] = subject
    message_body["From"] = sender
    message_body["To"] = receiver

    html = f"""\
{message}
"""
    html_part = MIMEText(html, "html")
    message_body.attach(html_part) 
    try:
        with smtplib.SMTP(host=host, port=port) as server:
            server.starttls(context=context) # Secure the connection
            server.login(user=username, password=password)
            
            server.sendmail(from_addr=sender, to_addrs=receiver, msg=message_body.as_string())
            print('all good')
        
    except Exception as e:
        print(e)

def generic_email(context, template):
    loader = FileSystemLoader("libs/templates")
    environment = Environment(loader=loader)
    print(loader.list_templates())
    template = environment.get_template(template)
    print(template.render(context))
    return template.render(context)