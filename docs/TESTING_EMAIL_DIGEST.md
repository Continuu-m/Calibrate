# Testing the Email Digest Generator

To test the daily digest email functionality locally, you'll need a fake SMTP server to catch the emails so they don't actually go out on the real internet, and a way to hit the manual test endpoint.

## 1. Set up a Fake SMTP Server (Mailtrap)
We need a place to "catch" the emails being sent. [Mailtrap](https://mailtrap.io/) is the industry standard for this and it's free.
1. Go to [Mailtrap.io](https://mailtrap.io/) and create a free account.
2. Navigate to **Email Testing** -> **Inboxes** -> **My Inbox**.
3. Under the "SMTP Settings" tab, click "Show Credentials". You'll see a Username and Password.

## 2. Update your `.env` file
Open your `backend/.env` file and update the `MAIL_USERNAME` and `MAIL_PASSWORD` with the credentials you just got from Mailtrap. It should look like this:

```dotenv
# Email Settings
MAIL_USERNAME=your_mailtrap_username_here
MAIL_PASSWORD=your_mailtrap_password_here
MAIL_FROM=hello@calibrate.app
MAIL_PORT=2525
MAIL_SERVER=sandbox.smtp.mailtrap.io
MAIL_STARTTLS=True
MAIL_SSL_TLS=False
USE_CREDENTIALS=True
VALIDATE_CERTS=True
```
*Note: If your backend server is running, make sure to restart it so it picks up the `.env` changes.*

## 3. Hit the Test Endpoint
Since the automated cron job only runs at 9:00 AM UTC, there is a manual endpoint so you don't have to wait. 

The easiest way to hit it is using the built-in FastAPI Swagger UI:
1. Make sure you are logged into your Calibrate frontend (so you have an active user session in your database).
2. Go to your backend's Swagger UI in your browser: [http://localhost:8000/docs](http://localhost:8000/docs)
3. Click the green **Authorize** button at the top right and paste your JWT token. *(You can grab your token from your browser's Local Storage or Network tab in the frontend).*
4. Scroll down to the **Tasks** section and find the `POST /tasks/test-digest` endpoint.
5. Click **Try it out** -> **Execute**.

## 4. Check your Mail
Go back to your Mailtrap Inbox. You should instantly see a new email titled "Your Calibrate Digest"! It will summarize the tasks you completed or left overdue in the database over the last 24 hours.
