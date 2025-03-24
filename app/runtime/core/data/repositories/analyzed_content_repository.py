from sqlalchemy.orm import Session
from core.data.models.orm_models import AnalyzedContent
from config.database import get_db_session

class AnalyzedContentRepository:
    """
    Repositorio para manejar el almacenamiento y consulta del contenido analizado.
    """

    def __init__(self):
        self.session: Session = get_db_session()

    def create_or_update(self, version_id: int, text: str, entities: dict):
        """
        Crea o actualiza el contenido analizado de una versión de documento.
        Si ya existe, actualiza el texto y las entidades.
        """
        existing_record = self.session.query(AnalyzedContent).filter_by(version_id=version_id).first()

        if existing_record:
            existing_record.text = text
            existing_record.entities = entities
        else:
            new_content = AnalyzedContent(version_id=version_id, text=text, entities=entities)
            self.session.add(new_content)

        self.session.commit()

    def get_by_version_id(self, version_id: int):
        """
        Obtiene el contenido analizado de una versión específica.
        """
        record = self.session.query(AnalyzedContent).filter_by(version_id=version_id).first()
        return record if record else None