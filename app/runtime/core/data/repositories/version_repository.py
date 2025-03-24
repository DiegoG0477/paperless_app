from sqlalchemy.orm import Session
from core.data.models.orm_models import Version
from config.database import get_db_session

class VersionRepository:
    def __init__(self):
        self.session: Session = get_db_session()

    def get_version_by_hash(self, file_hash: str):
        """Busca una versión de documento por su hash de archivo."""
        return self.session.query(Version).filter_by(file_hash=file_hash).first()

    def get_latest_version_by_document_id(self, document_id: int):
        """Obtiene la versión más reciente de un documento dado."""
        return (
            self.session.query(Version)
            .filter_by(document_id=document_id)
            .order_by(Version.updated_at.desc())  # Ordenado por la fecha más reciente
            .first()
        )

    def add_version(self, document_id, version_tag, file_path, file_hash, author_id, comment, size_mb):
        """Crea una nueva versión del documento."""
        new_version = Version(
            document_id=document_id,
            version_tag=version_tag,
            file_path=file_path,
            file_hash=file_hash,
            author_id=author_id,
            comment=comment,
            size_mb=size_mb
        )
        self.session.add(new_version)
        self.session.commit()
        self.session.refresh(new_version)  # Asegurar que se retorne con el ID generado
        return new_version
