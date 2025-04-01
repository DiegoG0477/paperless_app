from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional
from core.data.models.orm_models import Document
from config.database import get_db_session
from core.data.services.cache_service import (
    get_cached_document_by_id,
    get_cached_document_by_hash,
    get_all_cached_documents,
    cache_document_list,
    cache_document
)

class DocumentRepository:
    def __init__(self):
        self.session: Session = get_db_session()
        
    def _parse_cached_date(self, date_value: str | datetime) -> datetime:
        """Convierte una fecha cacheada a datetime"""
        return (
            datetime.fromisoformat(date_value.strip('"'))
            if isinstance(date_value, str)
            else date_value
        )

    def _prepare_cached_document(self, cached_doc: dict) -> dict:
        """Prepara un documento cacheado para ser convertido a Document"""
        if cached_doc:
            cached_doc = cached_doc.copy()  # Evitar modificar el original en caché
            cached_doc['created_at'] = self._parse_cached_date(cached_doc['created_at'])
        return cached_doc

    def get_all_documents(self):
        """Obtiene todos los documentos ordenados por fecha de creación descendente."""
        # Intentar obtener de la caché primero
        if cached_documents := get_all_cached_documents():
            # Convertir los documentos cacheados a objetos Document
            return [
                Document(**self._prepare_cached_document(doc))
                for doc in cached_documents
            ]

        # Si no está en caché, obtener de la BD
        documents = self.session.query(Document).order_by(Document.created_at.desc()).all()
        
        # Cachear la lista completa
        if documents:
            print("documentos encontrados ", documents)
            cache_document_list(documents)
        
        return documents

    def get_document_by_id(self, document_id: int) -> Optional[Document]:
        """Busca un documento por su ID."""
        # Intentar obtener de la caché primero
        if cached_doc := get_cached_document_by_id(document_id):
            return Document(**self._prepare_cached_document(cached_doc))

        # Si no está en caché, obtener de la BD
        if doc := self.session.query(Document).filter_by(id=document_id).first():
            cache_document(doc)  # Cachear para futuras consultas
            return doc
        
        return None

    def get_document_by_unique_hash(self, unique_hash: str) -> Optional[Document]:
        """Busca un documento por su hash único."""
        # Intentar obtener de la caché primero
        if cached_doc := get_cached_document_by_hash(unique_hash):
            return Document(**self._prepare_cached_document(cached_doc))
            
        # Si no está en caché, obtener de la BD
        if doc := self.session.query(Document).filter_by(unique_hash=unique_hash).first():
            cache_document(doc)  # Cachear para futuras consultas
            return doc
            
        return None

    def get_document_by_main_path(self, main_path: str):
        """Busca un documento en la base de datos usando su ruta principal."""
        # Este método va directo a la BD por ser una búsqueda menos común
        doc = self.session.query(Document).filter_by(main_path=main_path).first()
        if doc:
            cache_document(doc)  # Cachear para futuras consultas
        return doc

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
        self.session.refresh(new_document)
        cache_document(new_document)  # Cachear el nuevo documento
        return new_document