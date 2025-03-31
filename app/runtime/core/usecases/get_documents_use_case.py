# /app/runtime/core/usecases/get_documents_use_case.py
from typing import Optional
from core.data.repositories.document_repository import DocumentRepository
from core.data.repositories.version_repository import VersionRepository
from core.data.repositories.analyzed_content_repository import AnalyzedContentRepository
from core.data.repositories.spelling_error_repository import SpellingErrorRepository
from core.data.repositories.author_repository import AuthorRepository

class GetDocumentsUseCase:
    def __init__(self):
        self.document_repository = DocumentRepository()
        self.version_repository = VersionRepository()
        self.analyzed_content_repository = AnalyzedContentRepository()
        self.spelling_error_repository = SpellingErrorRepository()
        self.author_repository = AuthorRepository()

    
    def format_document(self, document, versions, analyzed_content, spelling_errors):
        """Helper para formatear la información de un documento"""
        latest_version = versions[0] if versions else None
        
        # Obtener todos los author_ids de las versiones en una sola llamada
        author_ids = [v.author_id for v in versions if v.author_id]
        authors_dict = self.author_repository.get_authors_by_ids(author_ids) if author_ids else {}
        
        return {
            "id": document.id,
            "title": document.title,
            "description": document.description,
            "type": document.type,
            "fileType": document.main_path.split('.')[-1] if document.main_path else None,
            "fileSize": "N/A",
            "versions": [{
                "id": version.id,
                "version_tag": version.version_tag,
                "updated_at": version.updated_at.isoformat(),
                "author": authors_dict.get(version.author_id).full_name() if version.author_id in authors_dict else "Sistema",
                "comment": version.comment
            } for version in versions],
            "author": authors_dict.get(latest_version.author_id).full_name() if latest_version and latest_version.author_id in authors_dict else "Sistema",
            "created_at": document.created_at.isoformat(),
            "updated_at": latest_version.updated_at.isoformat() if latest_version else document.created_at.isoformat(),
            "spelling_errors": [{
                "word": error["word"],
                "suggestion": error["suggestions"][0] if error["suggestions"] else "",
                "suggestions": error["suggestions"],
                "context": ""
            } for error in spelling_errors],
            "entities": analyzed_content.entities if analyzed_content else {
                "personas": [],
                "organizaciones": [],
                "fechas": [],
                "ubicaciones": [],
                "terminos_clave": []
            }
        }

    def execute(self, document_id: Optional[int] = None):
        """
        Obtiene un documento específico o todos los documentos si no se proporciona ID.
        """
        try:
            if document_id is not None:
                # Obtener un documento específico
                document = self.document_repository.get_document_by_id(document_id)
                if not document:
                    return {
                        "success": False,
                        "error": "Documento no encontrado"
                    }

                versions = self.version_repository.get_versions_by_document_id(document.id)
                latest_version = versions[0] if versions else None
                analyzed_content = self.analyzed_content_repository.get_by_version_id(latest_version.id) if latest_version else None
                # Aquí está el cambio: get_by_version_id -> get_errors_by_version
                spelling_errors = self.spelling_error_repository.get_errors_by_version(latest_version.id) if latest_version else []

                return {
                    "success": True,
                    "data": self.format_document(document, versions, analyzed_content, spelling_errors)
                }
            else:
                # Obtener todos los documentos
                documents = self.document_repository.get_all_documents()
                formatted_documents = []

                for document in documents:
                    versions = self.version_repository.get_versions_by_document_id(document.id)
                    latest_version = versions[0] if versions else None
                    analyzed_content = self.analyzed_content_repository.get_by_version_id(latest_version.id) if latest_version else None
                    # Aquí también: get_by_version_id -> get_errors_by_version
                    spelling_errors = self.spelling_error_repository.get_errors_by_version(latest_version.id) if latest_version else []

                    formatted_documents.append(
                        self.format_document(document, versions, analyzed_content, spelling_errors)
                    )

                return {
                    "success": True,
                    "data": formatted_documents
                }

        except Exception as e:
            return {
                "success": False,
                "error": f"Error al obtener {'el documento' if document_id else 'los documentos'}: {str(e)}"
            }