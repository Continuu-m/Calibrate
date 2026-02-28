from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
import pytz

from app.models.user import User
from app.models.task import Task, TaskStatus
from app.services.email_service import send_email

def format_time(mins: float) -> str:
    if not mins:
        return "0min"
    h = int(mins // 60)
    m = int(mins % 60)
    return f"{h}h {m}min" if h > 0 else f"{m}min"

async def generate_user_digest(db: Session, user: User):
    """
    Fetches the user's tasks for today (or the previous day if running at midnight)
    and constructs the HTML for the daily digest email.
    """
    # Using UTC for simplicity; in production, use user's timezone from user.preferences
    tz = pytz.timezone(user.preferences.get("timezone", "UTC"))
    now = datetime.now(tz)
    
    # Calculate start and end of "yesterday" (or "today" depending on when this runs)
    # Let's say this runs at 9AM. We summarize what happened *yesterday*.
    yesterday = now - timedelta(days=1)
    start_of_day = yesterday.replace(hour=0, minute=0, second=0, microsecond=0)
    end_of_day = yesterday.replace(hour=23, minute=59, second=59, microsecond=999999)

    # 1. Fetch completed tasks
    completed_tasks = db.query(Task).filter(
        Task.user_id == user.id,
        Task.status == TaskStatus.completed,
        Task.completed_at >= start_of_day,
        Task.completed_at <= end_of_day
    ).all()

    # 2. Fetch overdue/deferred tasks
    in_progress_tasks = db.query(Task).filter(
        Task.user_id == user.id,
        Task.status.in_([TaskStatus.planned, TaskStatus.in_progress]),
        Task.deadline <= end_of_day
    ).all()

    # Calculate metrics
    total_completed_time = sum([t.actual_time or t.estimated_time or 0 for t in completed_tasks])
    num_completed = len(completed_tasks)
    num_overdue = len(in_progress_tasks)

    # Build HTML
    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; background-color: #f6f5f4; color: #1c1917; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e7e5e4; padding: 30px; border-radius: 4px;">
                <h2 style="color: #b91c1c; margin-top: 0;">Calibrate Daily Digest</h2>
                <p>Hello {user.full_name or 'User'},</p>
                <p>Here is your summary for <strong>{yesterday.strftime('%A, %B %d')}</strong>:</p>
                
                <div style="display: flex; gap: 20px; margin-bottom: 20px;">
                    <div style="background-color: #fef2f2; border-left: 4px solid #b91c1c; padding: 15px; flex: 1;">
                        <div style="font-size: 10px; font-weight: bold; color: #78716c; text-transform: uppercase;">Time Completed</div>
                        <div style="font-size: 24px; font-weight: bold; margin-top: 5px;">{format_time(total_completed_time)}</div>
                    </div>
                    <div style="background-color: #f5f5f4; border-left: 4px solid #a8a29e; padding: 15px; flex: 1;">
                        <div style="font-size: 10px; font-weight: bold; color: #78716c; text-transform: uppercase;">Tasks Done</div>
                        <div style="font-size: 24px; font-weight: bold; margin-top: 5px;">{num_completed}</div>
                    </div>
                </div>

                <h3>✅ Completed Tasks</h3>
                <ul style="padding-left: 20px;">
                    { ''.join([f"<li>{t.title} <em>({format_time(t.actual_time or t.estimated_time)})</em></li>" for t in completed_tasks]) or "<li>No tasks completed yesterday.</li>" }
                </ul>

                <h3>⚠️ Rollover/Overdue Tasks</h3>
                <ul style="padding-left: 20px;">
                    { ''.join([f"<li>{t.title} <em>({format_time(t.estimated_time)})</em></li>" for t in in_progress_tasks]) or "<li>No overdue tasks! Great job.</li>" }
                </ul>

                <br />
                <hr style="border: none; border-top: 1px solid #e7e5e4;" />
                <p style="font-size: 11px; color: #a8a29e; text-align: center; margin-top: 20px;">
                    You are receiving this because your daily notifications are enabled in Calibrate.<br/>
                    <a href="#" style="color: #b91c1c;">Update Preferences</a>
                </p>
            </div>
        </body>
    </html>
    """
    
    subject = f"Your Calibrate Digest: {num_completed} tasks completed"
    await send_email(subject, user.email, html_content)
