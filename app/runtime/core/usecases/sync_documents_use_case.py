import os
from pathlib import Path
import time
from core.data.repositories.document_repository import DocumentRepository
from core.data.repositories.version_repository import VersionRepository
from core.data.repositories.author_repository import AuthorRepository
from core.data.repositories.analyzed_content_repository import AnalyzedContentRepository
from core.data.repositories.legal_calendar_repository import LegalCalendarRepository
from core.data.repositories.spelling_error_repository import SpellingErrorRepository
from core.data.services.file_copy_service import copy_file_to_storage
from core.data.services.metadata_extractor import extract_metadata
from core.data.services.file_scanner import scan_file
from core.data.services.hash_service import calculate_doc_hash, calculate_version_hash
from core.data.services.spellcheck_service import detect_spelling_errors
from core.data.services.entity_detection_service import extract_entities
from core.data.services.cache_service import update_cache_for_document

# Lista de extensiones válidas
ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx"}

def sync_documents(main_path: str):
    """
    Sincroniza documentos en el directorio 'main_path' de forma recursiva.
    Por cada documento:
      1. Extrae y procesa metadatos.
      2. Verifica y actualiza el autor en la BD.
      3. Extrae el contenido completo (usando OCR si es necesario).
      4. Genera la copia interna del archivo y crea el tag de versión.
      5. Genera el hash único del documento y del archivo para identificar versiones.
      6. Crea las entradas en la BD (Document y Version).
      7. Detecta errores ortográficos y los registra en la BD.
      8. Extrae entidades del fulltext.
      9. Guarda el fulltext y las entidades en la tabla analyzed_content.
      10. Genera eventos de calendario a partir de entidades de tipo fecha.
      11. Actualiza la caché para este documento.
      12. Repite para cada archivo.
    """
    # Instanciar repositorios
    doc_repo = DocumentRepository()
    ver_repo = VersionRepository()
    author_repo = AuthorRepository()
    analyzed_repo = AnalyzedContentRepository()
    calendar_repo = LegalCalendarRepository()
    spelling_repo = SpellingErrorRepository()

    # Recorrer recursivamente el directorio principal
    for root, dirs, files in os.walk(main_path):
        for file in files:
            ext = Path(file).suffix.lower()
            if ext not in ALLOWED_EXTENSIONS:
                continue

            file_path = os.path.join(root, file)
            print(f"📂 Procesando: {file_path}")

            # 🟢 1. Extraer metadatos del documento
            metadata = extract_metadata(file_path)

            # 🟢 2. Verificar y actualizar el autor en la BD
            author_name = metadata.get("author", "").strip()
            if author_name:
                author = author_repo.get_or_create_author(author_name)
            else:
                author = None  # Si no hay autor, se registrará sin este campo en la BD

            # 🟢 3. Extraer el contenido completo con OCR si es necesario
            full_text = scan_file(file_path)


            # 🟢 4. Generar tag de versión y copiar el archivo a la estructura interna
            version_tag = f"v{int(time.time())}"
            
            # 🟢 5. Generar hashes para el documento y la versión
            doc_unique_hash = calculate_doc_hash(file_path)
            version_hash = calculate_version_hash(file_path)

            # 🟢 6. Crear entrada en la BD (Document y Version)
            document = doc_repo.get_document_by_unique_hash(doc_unique_hash)
            if not document:
                document = doc_repo.create_document(
                    title=metadata.get("title", file),
                    description=metadata.get("description", ""),
                    doc_type="desconocido",
                    unique_hash=doc_unique_hash,
                    main_path=file_path
                )

            copied_file_path = copy_file_to_storage(file_path, document.id, version_tag)
            version = ver_repo.add_version(
                document_id=document.id,
                version_tag=version_tag,
                file_path=copied_file_path,
                file_hash=version_hash,
                author_id=author.id if author else None,
                comment="",
                size_mb=metadata.get("size_mb", 0.0)
            )

            # 🟢 7. Detectar errores ortográficos en el fulltext
            spelling_errors = detect_spelling_errors(full_text)
            for error in spelling_errors:
                spelling_repo.create_error(
                    error_word=error.get("word"),
                    version_id=version.id
                )

            # 🟢 8. Extraer entidades del fulltext
            entities = extract_entities(full_text)

            # 🟢 9. Guardar el fulltext y las entidades en analyzed_content
            analyzed_repo.create_or_update(
                version_id=version.id,
                text=full_text,
                entities=entities
            )

            # 🟢 10. Generar eventos en el calendario a partir de entidades de tipo fecha
            for fecha in entities.get("fechas", []):
                calendar_repo.create_event(
                    document_id=document.id,
                    event="Evento generado automáticamente",
                    date=fecha.get("valor"),
                    time=None
                )

            # 🟢 11. Actualizar la caché para este documento
            update_cache_for_document(file_path, doc_unique_hash, entities)

            print(f"✅ Documento procesado correctamente: {file_path}")

    return {"success": True, "message": "Sincronización completada."}
