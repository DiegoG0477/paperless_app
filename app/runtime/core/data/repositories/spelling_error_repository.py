from sqlalchemy.orm import Session
from core.data.models.orm_models import SpellErrors
from core.domain.models.spelling_error import SpellingErrorDomain
from core.data.services.spellcheck_service import get_suggestions
from config.database import get_db_session
from core.data.services.cache_service import (
    get_cached_spelling_errors_by_version_id,
    cache_spelling_errors,
    get_cached_word_suggestions
)

class SpellingErrorRepository:
    def __init__(self):
        self.session: Session = get_db_session()

    def create_error(self, error_word: str, version_id: int):
        """Registra un error ortográfico en la base de datos."""
        new_error = SpellErrors(word=error_word, version_id=version_id)
        self.session.add(new_error)
        self.session.commit()
        self.session.refresh(new_error)
        
        error_data = {
            'id': new_error.id,
            'word': new_error.word,
            'suggestions': get_suggestions(new_error.word),
            'version_id': new_error.version_id
        }
        
        # Actualizar la caché de errores para esta versión
        current_errors = get_cached_spelling_errors_by_version_id(version_id) or []
        current_errors.append(error_data)
        cache_spelling_errors(version_id, current_errors)
        
        return SpellingErrorDomain(
            error_id=new_error.id,
            word=new_error.word,
            version_id=new_error.version_id
        )

    def get_errors_by_version(self, version_id: int):
        """
        Obtiene los errores ortográficos de una versión específica.
        Prioriza obtener las sugerencias desde la caché.
        """
        # Intentar obtener errores de la caché primero
        cached_errors = get_cached_spelling_errors_by_version_id(version_id)
        if cached_errors:
            return cached_errors

        # Si no está en caché, obtener de la BD
        errors = self.session.query(SpellErrors).filter_by(version_id=version_id).all()
        
        # Procesar cada error usando sugerencias cacheadas cuando sea posible
        errors_data = []
        for error in errors:
            # Intentar obtener sugerencias de la caché primero
            cached_suggestions = get_cached_word_suggestions(error.word)
            
            error_data = {
                'id': error.id,
                'word': error.word,
                'version_id': error.version_id,
                'suggestions': cached_suggestions if cached_suggestions is not None else get_suggestions(error.word)
            }
            errors_data.append(error_data)
        
        if errors_data:
            cache_spelling_errors(version_id, errors_data)
        
        return errors_data
    
    def delete_errors_by_version(self, version_id: int):
        """Elimina todos los errores ortográficos de una versión de documento."""
        self.session.query(SpellErrors).filter_by(version_id=version_id).delete()
        self.session.commit()
        # Limpiar la caché para esta versión
        cache_spelling_errors(version_id, [])