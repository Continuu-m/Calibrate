from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
import logging
import asyncio

from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.models.user import User
from app.services.digest_service import generate_user_digest

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()

async def send_daily_digests():
    """
    Scheduled job to send daily digests to all active users who have notifications enabled.
    """
    logger.info("Starting daily email digest job...")
    db: Session = SessionLocal()
    try:
        # Fetch all active users.
        # In production, we might want to batch these or fetch them based on timezone.
        users = db.query(User).filter(User.is_active == True).all()

        for user in users:
            # Check if this user wants notifications based on preferences
            notifications_enabled = user.preferences.get("notifications_enabled", True)
            if notifications_enabled:
                try:
                    await generate_user_digest(db, user)
                except Exception as e:
                    logger.error(f"Failed to send digest to {user.email}: {e}")
                    
    except Exception as e:
        logger.error(f"Error in send_daily_digests job: {e}")
    finally:
        db.close()
    
    logger.info("Finished daily email digest job.")

def setup_scheduler():
    # Run every day at 09:00 AM UTC (adjust as needed, or trigger per user timezone)
    scheduler.add_job(send_daily_digests, CronTrigger(hour=9, minute=0))
    scheduler.start()
    logger.info("Scheduler started.")

def shutdown_scheduler():
    scheduler.shutdown()
    logger.info("Scheduler shutdown.")
