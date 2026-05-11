"""Import all models here so Alembic autogenerate sees every table."""
from app.models.base import Base, BaseModel
from app.models.user import User, UserProfile, OTPCode
from app.models.product import Product
from app.models.order import Order, OrderItem, Payment
from app.models.appointment import Appointment
from app.models.chat import ChatSession, ChatMessage
from app.models.health_log import HealthLog, Reminder
from app.models.content import ContentArticle

__all__ = [
    "Base",
    "BaseModel",
    "User",
    "UserProfile",
    "OTPCode",
    "Product",
    "Order",
    "OrderItem",
    "Payment",
    "Appointment",
    "ChatSession",
    "ChatMessage",
    "HealthLog",
    "Reminder",
    "ContentArticle",
]
