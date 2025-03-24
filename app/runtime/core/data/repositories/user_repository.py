# /app/runtime/data/repositories/user_repository.py
from core.data.models.orm_models import User
from config.database import get_db_session

class UserRepository:
    def get_user_by_email(self, email: str):
        session = get_db_session()
        try:
            user_orm = session.query(User).filter_by(email=email).first()
            if user_orm:
                return user_orm.to_domain()  # Convertir a dominio
            return None
        finally:
            session.close()