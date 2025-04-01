from sqlalchemy.orm import Session
from core.data.models.orm_models import Version
from config.database import get_db_session
from core.data.services.cache_service import (
    get_cached_version_by_id,
    get_cached_versions_by_document_id,
    get_cached_latest_version_by_document_id,
    cache_version
)

class VersionRepository:
    def __init__(self):
        self.session: Session = get_db_session()

    def get_version_by_hash(self, file_hash: str):
        """Busca una versión de documento por su hash de archivo."""
        # Este método va directo a la BD por ser una búsqueda menos común
        version = self.session.query(Version).filter_by(file_hash=file_hash).first()
        if version:
            cache_version(version)  # Cachear para futuras consultas
        return version

    def get_latest_version_by_document_id(self, document_id: int):
        """Obtiene la versión más reciente de un documento dado."""
        # Intentar obtener de la caché primero
        cached_version = get_cached_latest_version_by_document_id(document_id)
        if cached_version:
            return Version(**cached_version)

        # Si no está en caché, obtener de la BD
        version = (
            self.session.query(Version)
            .filter_by(document_id=document_id)
            .order_by(Version.updated_at.desc())
            .first()
        )
        if version:
            cache_version(version)  # Cachear para futuras consultas
        return version

    def get_versions_by_document_id(self, document_id: int):
        """Obtiene todas las versiones de un documento ordenadas por fecha descendente."""
        # Intentar obtener de la caché primero
        cached_versions = get_cached_versions_by_document_id(document_id)
        if cached_versions:
            return [Version(**v) for v in cached_versions]

        # Si no está en caché, obtener de la BD
        versions = (
            self.session.query(Version)
            .filter_by(document_id=document_id)
            .order_by(Version.updated_at.desc())
            .all()
        )
        # Cachear cada versión
        for version in versions:
            cache_version(version)
        return versions

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
        self.session.refresh(new_version)
        cache_version(new_version)  # Cachear la nueva versión
        return new_version