# /app/runtime/data/repositories/settings_repository.py
from core.data.models.orm_models import Settings
from config.database import get_db_session
from core.domain.models.settings import SettingsDomain

class SettingsRepository:
    def get_main_path(self):
        """
        Obtiene la ruta padre guardada en la configuración.
        """
        session = get_db_session()
        try:
            settings = session.query(Settings).first()
            if settings:
                return SettingsDomain(main_path=settings.main_path)
            return None
        finally:
            session.close()

    def set_main_path(self, new_path: str):
        """
        Establece la ruta padre de escaneo.
        - Si no hay configuración previa, inserta un nuevo registro.
        - Si ya existe, actualiza la ruta y borra la caché.
        """
        session = get_db_session()
        try:
            settings = session.query(Settings).first()
            if settings:
                settings.main_path = new_path
            else:
                settings = Settings(main_path=new_path)
                session.add(settings)

            session.commit()
        finally:
            session.close()
