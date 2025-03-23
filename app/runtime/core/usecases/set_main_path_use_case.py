# /app/runtime/core/use_cases/set_main_path_use_case.py
from core.data.repositories.settings_repository import SettingsRepository

class SetMainPathUseCase:
    def __init__(self, settings_repository: SettingsRepository):
        self.settings_repository = settings_repository

    def execute(self, new_path: str):
        """
        Establece la ruta padre de escaneo.
        - Guarda la nueva ruta en la base de datos.
        - Borra la caché si existía una ruta anterior.
        """
        try:
            self.settings_repository.set_main_path(new_path)
            return {"success": True, "message": "Ruta establecida correctamente."}
        except Exception as e:
            return {"success": False, "error": f"Error al establecer la ruta: {str(e)}"}