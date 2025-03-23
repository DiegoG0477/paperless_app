class LoginUseCase:
    def __init__(self, user_repository, password_hasher):
        self.user_repository = user_repository
        self.password_hasher = password_hasher

    def execute(self, email: str, password: str):
        """
        Ejecuta el login de usuario.
        - Busca el usuario.
        - Verifica la contraseña.
        - Retorna los datos del usuario si es válido.
        """
        user = self.user_repository.get_user_by_email(email)
        if not user:
            return {"success": False, "error": "Usuario no encontrado"}

        if not self.password_hasher.verify(password, user.password_hash):
            return {"success": False, "error": "Contraseña incorrecta"}

        return {
            "success": True,
            "user": {
                "user_id": user.id,
                "email": user.email,
                "first_name": user.personal_data.first_name if user.personal_data else None,
                "last_name": user.personal_data.last_name if user.personal_data else None,
                "registered_at": str(user.registered_at)
            }
        }
