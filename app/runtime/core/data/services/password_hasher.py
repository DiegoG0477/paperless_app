# /app/runtime/data/services/password_hasher.py
import bcrypt

class PasswordHasher:
    def hash(self, password: str) -> str:
        """
        Hashea una contraseña usando bcrypt.
        """
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    def verify(self, password: str, hashed_password: str) -> bool:
        """
        Verifica si una contraseña coincide con su hash.
        """
        return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))