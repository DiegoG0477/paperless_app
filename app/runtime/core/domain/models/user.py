# /app/runtime/core/domain/user.py

class UserDomain:
    def __init__(self, user_id, email, password_hash, registered_at, first_name=None, last_name=None):
        self.id = user_id
        self.email = email
        self.password_hash = password_hash
        self.registered_at = registered_at
        self.first_name = first_name
        self.last_name = last_name

    def __repr__(self):
        return f"UserDomain({self.id}, {self.email})"

    # Aquí podrías incluir métodos de lógica de negocio propios del dominio,
    # por ejemplo, validaciones o reglas de negocio específicas.
