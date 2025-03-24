from sqlalchemy.orm import Session
from core.data.models.orm_models import Document
from config.database import get_db_session

class DocumentRepository:
    def __init__(self):
        self.session: Session = get_db_session()

    def get_document_by_unique_hash(self, unique_hash: str):
        """Busca un documento por su hash único."""
        return self.session.query(Document).filter_by(unique_hash=unique_hash).first()

    def get_document_by_main_path(self, main_path: str):
        """Busca un documento en la base de datos usando su ruta principal."""
        return self.session.query(Document).filter_by(main_path=main_path).first()

    def create_document(self, title, description, doc_type, unique_hash, main_path):
        """Crea un nuevo documento en la BD."""
        new_document = Document(
            title=title,
            description=description,
            type=doc_type,
            unique_hash=unique_hash,
            main_path=main_path
        )
        self.session.add(new_document)
        self.session.commit()
        self.session.refresh(new_document)  # Refrescar para asegurarse de que los valores autogenerados están actualizados
        return new_document