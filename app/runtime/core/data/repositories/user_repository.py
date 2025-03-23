from app.runtime.models.user import User
from app.runtime.data.database import get_db_session

class UserRepository:
    def get_user_by_email(self, email: str):
        """
        Busca un usuario en la base de datos por email.
        """
        session = get_db_session()
        try:
            return session.query(User).filter_by(email=email).first()
        finally:
            session.close()
