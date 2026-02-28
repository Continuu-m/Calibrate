import os
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from dotenv import load_dotenv

load_dotenv()

conf = ConnectionConfig(
    MAIL_USERNAME=os.environ.get("MAIL_USERNAME", "fake_user"),
    MAIL_PASSWORD=os.environ.get("MAIL_PASSWORD", "fake_password"),
    MAIL_FROM=os.environ.get("MAIL_FROM", "hello@calibrate.app"),
    MAIL_PORT=int(os.environ.get("MAIL_PORT", 2525)),
    MAIL_SERVER=os.environ.get("MAIL_SERVER", "sandbox.smtp.mailtrap.io"),
    MAIL_STARTTLS=os.environ.get("MAIL_STARTTLS", "True").lower() == "true",
    MAIL_SSL_TLS=os.environ.get("MAIL_SSL_TLS", "False").lower() == "true",
    USE_CREDENTIALS=os.environ.get("USE_CREDENTIALS", "True").lower() == "true",
    VALIDATE_CERTS=os.environ.get("VALIDATE_CERTS", "True").lower() == "true",
)

fast_mail = FastMail(conf)

async def send_email(subject: str, email_to: str, body: str):
    """
    Sends an email using fastapi-mail.
    """
    message = MessageSchema(
        subject=subject,
        recipients=[email_to],
        body=body,
        subtype=MessageType.html
    )

    try:
        await fast_mail.send_message(message)
        print(f"DEBUG: Sent email to {email_to}")
    except Exception as e:
        print(f"Error sending email to {email_to}: {e}")
