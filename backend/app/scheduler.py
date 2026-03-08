from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
import logging
import asyncio
from datetime import datetime

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

async def sync_calendars():
    """
    Background worker that syncs Google Calendar events for all connected users
    and updates their cached capacity metrics.
    """
    logger.info("Starting background calendar sync job...")
    db: Session = SessionLocal()
    try:
        from app.tasks.service import get_daily_capacity
        
        # Fetch all users with connected calendars (Google or Outlook)
        from sqlalchemy import or_
        users = db.query(User).filter(or_(User.google_calendar_connected == True, User.outlook_calendar_connected == True)).all()

        for user in users:
            try:
                # ─── 🔄 Token Refresh Logic ──────────────────────────────────────────
                # For simplicity, we just refresh before every background sync 
                # to ensure get_daily_capacity doesn't fail on expired tokens.
                
                # Google Refresh
                if user.google_calendar_connected and user.google_refresh_token:
                    try:
                        from app.integrations.google_calendar import _build_flow
                        flow = _build_flow()
                        flow.refresh_token(user.google_refresh_token)
                        user.google_access_token = flow.credentials.token
                        # Refresh token might also change
                        if flow.credentials.refresh_token:
                            user.google_refresh_token = flow.credentials.refresh_token
                    except Exception as e:
                        logger.error(f"Failed to refresh Google token for {user.email}: {e}")

                # Outlook Refresh
                if user.outlook_calendar_connected and user.outlook_refresh_token:
                    try:
                        from app.integrations.outlook_calendar import refresh_outlook_token
                        tokens = refresh_outlook_token(user.outlook_refresh_token)
                        user.outlook_access_token = tokens["access_token"]
                        if tokens.get("refresh_token"):
                            user.outlook_refresh_token = tokens["refresh_token"]
                    except Exception as e:
                        logger.error(f"Failed to refresh Outlook token for {user.email}: {e}")

                db.commit()

                # ─── 📊 Capacity Sync Logic ──────────────────────────────────────────
                # Recalculate capacity
                # Note: get_daily_capacity already handles the API calls
                new_capacity = get_daily_capacity(db, user)
                
                # Check for severity increase (for Real-time Notifications)
                old_capacity = user.cached_capacity or {}
                old_severity = old_capacity.get("severity", "none")
                new_severity = new_capacity.severity

                severity_levels = {"none": 0, "caution": 1, "warning": 2, "critical": 3}
                if severity_levels.get(new_severity, 0) > severity_levels.get(old_severity, 0):
                    user.alert_pending = True
                    logger.info(f"Alert triggered for {user.email}: {old_severity} -> {new_severity}")

                # Update cache
                user.cached_capacity = new_capacity.model_dump()
                user.last_calendar_sync = datetime.utcnow()
                db.commit()
                
            except Exception as e:
                logger.error(f"Failed to sync calendar for {user.email}: {e}")
                db.rollback()

    except Exception as e:
        logger.error(f"Error in sync_calendars job: {e}")
    finally:
        db.close()
    logger.info("Finished background calendar sync job.")


def setup_scheduler():
    # 1. Daily Summary at 9:00 AM UTC
    scheduler.add_job(send_daily_digests, CronTrigger(hour=9, minute=0))
    
    # 2. Periodic Calendar Sync (every 15 minutes)
    scheduler.add_job(sync_calendars, "interval", minutes=15)
    
    scheduler.start()
    logger.info("Scheduler started with periodic sync and daily digests.")

def shutdown_scheduler():
    scheduler.shutdown()
    logger.info("Scheduler shutdown.")
