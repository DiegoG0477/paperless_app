from sqlalchemy.orm import Session
from core.data.models.orm_models import AnalyzedContent
from config.database import get_db_session
from core.data.services.cache_service import (
    get_cached_analyzed_content_by_version_id,
    cache_analyzed_content
)

class AnalyzedContentRepository:
    def __init__(self):
        self.session: Session = get_db_session()

    def create_or_update(self, version_id: int, text: str, entities: dict):
        """
        Crea o actualiza el contenido analizado de una versión de documento.
        """
        existing_record = self.session.query(AnalyzedContent).filter_by(version_id=version_id).first()

        if existing_record:
            existing_record.text = text
            existing_record.entities = entities
            content = existing_record
        else:
            content = AnalyzedContent(version_id=version_id, text=text, entities=entities)
            self.session.add(content)

        self.session.commit()
        self.session.refresh(content)
        cache_analyzed_content(content)  # Cachear el contenido
        return content

    def get_by_version_id(self, version_id: int):
        """Obtiene el contenido analizado de una versión específica."""
        # Intentar obtener de la caché primero
        cached_content = get_cached_analyzed_content_by_version_id(version_id)
        if cached_content:
            return AnalyzedContent(**cached_content)

        # Si no está en caché, obtener de la BD
        content = self.session.query(AnalyzedContent).filter_by(version_id=version_id).first()
        if content:
            cache_analyzed_content(content)  # Cachear para futuras consultas
        return content