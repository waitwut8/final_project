import smtplib, ssl
from dotenv import load_dotenv
from os import getenv
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from jinja2 import Environment, FileSystemLoader

# The one true sender
DEFAULT_SENDER = "waitwut8@gmail.com"

def send_email(receiver, subject, message):
    """
    Send an email using AWS SMTP with a fixed sender address.
    """
    host = "email-smtp.ap-southeast-2.amazonaws.com"

    # Load secrets
    load_dotenv(override=True)
    username = getenv("SMTP_USER")
    password = getenv("SMTP_PASS")
    
    port = 587  # TLS port
    context = ssl.SSLContext(ssl.PROTOCOL_TLSv1_2)

    # Build the email
    message_body = MIMEMultipart("alternative")
    message_body["Subject"] = subject
    message_body["From"] = DEFAULT_SENDER
    message_body["To"] = receiver

    html_part = MIMEText(message, "html")
    message_body.attach(html_part)

    # Send it
    with smtplib.SMTP(host=host, port=port) as server:
        server.starttls(context=context)
        server.login(user=username, password=password)
        resp = server.sendmail(
            from_addr=DEFAULT_SENDER,
            to_addrs=receiver,
            msg=message_body.as_string()
        )
        print("Email sent, server response:", resp)


def generic_email(context, template):
    """
    Render a Jinja2 template with provided context.
    """
    loader = FileSystemLoader("libs/templates")
    environment = Environment(loader=loader)
    template = environment.get_template(template)
    return template.render(context)
