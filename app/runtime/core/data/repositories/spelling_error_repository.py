# /app/runtime/core/data/repositories/spelling_error_repository.py
from sqlalchemy.orm import Session
from core.data.models.orm_models import SpellErrors
from core.domain.models.spelling_error import SpellingErrorDomain as SpellingError
from config.database import get_db_session

class SpellingErrorRepository:
    def __init__(self):
        self.session: Session = get_db_session()

    def create_error(self, error_word: str, version_id: int):
        """Registra un error ortográfico en la base de datos."""
        new_error = SpellErrors(word=error_word, version_id=version_id)
        self.session.add(new_error)
        self.session.commit()
        return SpellingError(id=new_error.id, word=new_error.word, version_id=new_error.version_id)

    def get_errors_by_version(self, version_id: int):
        """Obtiene los errores ortográficos de una versión específica."""
        errors = self.session.query(SpellErrors).filter_by(version_id=version_id).all()
        return [SpellingError(id=e.id, word=e.word, version_id=e.version_id) for e in errors]

    def delete_errors_by_version(self, version_id: int):
        """Elimina todos los errores ortográficos de una versión de documento."""
        self.session.query(SpellErrors).filter_by(version_id=version_id).delete()
        self.session.commit()
