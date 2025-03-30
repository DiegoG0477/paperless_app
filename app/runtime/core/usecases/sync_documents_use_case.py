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
from core.data.services.hash_service import calculate_version_hash, calculate_unique_hash
from core.data.services.spellcheck_service import detect_spelling_errors
from core.data.services.entity_detection_service import extract_entities
from core.data.services.cache_service import update_cache_for_document

# Lista de extensiones válidas
ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx"}

def sync_documents(main_path: str):
    """
    Sincroniza documentos en el directorio 'main_path' de forma recursiva.
    Por cada documento:
      1. Extrae y procesa metadatos. - CODE
      2. Verifica y actualiza el autor en la BD. - CODE
      3. Extrae el contenido completo (usando OCR si es necesario). - CODE
      4. Genera la copia interna del archivo y crea el tag de versión. - CODE
      5. Genera el hash único del documento y del archivo para identificar versiones. - CODE
      6. Crea las entradas en la BD (Document y Version). - CODE
      7. Detecta errores ortográficos y los registra en la BD. - CODE
      8. Extrae entidades del fulltext. - CODE
      9. Guarda el fulltext y las entidades en la tabla analyzed_content. - CODE
      10. Genera eventos de calendario a partir de entidades de tipo fecha. - CODE
      11. Actualiza la caché para este documento. - CODE
      12. Repite para cada archivo. (verifica existencia -> registra documento || verifica cambios 
      -> actualiza version || pasa al siguiente) - CODE
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

            previous_version = True

            # 1. Extraer metadatos del documento
            metadata = extract_metadata(file_path)

            print("metadata extraido: ", metadata)

            # 2. Verificar y actualizar el autor en la BD
            author_name = metadata.get("author", "").strip()
            if author_name:
                author = author_repo.get_or_create_author(author_name)
            else:
                author = None  # Si no hay autor, se registrará sin este campo en la BD
            
            # 3. Generar unique_hash (persistente) y version_hash (basado en contenido)
            doc_unique_hash = calculate_unique_hash(file_path, main_path)
            version_hash = calculate_version_hash(file_path)

            # 4. Verificar si el documento ya existe en la BD
            document = doc_repo.get_document_by_unique_hash(doc_unique_hash)
            if not document:
                # Si no existe, se registra como nuevo documento
                document = doc_repo.create_document(
                    title=metadata.get("title", file),
                    description=metadata.get("description", ""),
                    doc_type="desconocido",
                    unique_hash=doc_unique_hash,
                    main_path=file_path
                )

                previous_version = False

            # 4.5. Verificar si ha cambiado la versión
            if previous_version:
                latest_version = ver_repo.get_latest_version_by_document_id(document.id)
                if latest_version and latest_version.file_hash == version_hash:
                    print(f"📌 El documento '{file}' no ha cambiado, se omite nueva versión.")
                    continue  # Si no hay cambios, pasamos al siguiente documento

            # 5. Extraer el contenido completo con OCR si es necesario
            full_text = scan_file(file_path)

            # 6. Generar tag de versión y copiar el archivo a la estructura interna
            version_tag = f"v{int(time.time())}"

            # 6.8. Se crea una nueva versión porque el documento cambió
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

            # 7. Detectar errores ortográficos en el fulltext
            spelling_errors = detect_spelling_errors(full_text)
            for error in spelling_errors:
                spelling_repo.create_error(
                    error_word=error.get("word"),
                    version_id=version.id
                )

            # 8. Extraer entidades del fulltext (usa spaCy + regex)
            entities = extract_entities(full_text)

            print("entities finales ", entities)

            # Para fechas: Si alguna entrada de fecha no tiene evento, se asigna un valor por defecto.
            if "fechas" in entities:
                for idx, fecha in enumerate(entities["fechas"]):
                    if not fecha.get("evento"):
                        entities["fechas"][idx]["evento"] = f"Evento de {document.title}"

            # 9. Guardar el fulltext y las entidades en analyzed_content
            analyzed_repo.create_or_update(
                version_id=version.id,
                text=full_text,
                entities=entities
            )

            # 10. Generar eventos en el calendario a partir de entidades de tipo fecha
            for fecha in entities.get("fechas", []):
                # Si la fecha no tiene un evento asociado, se asigna un valor por defecto.
                evento = fecha.get("evento", f"Evento de {document.title}")

                # Se extraen fecha y hora, asegurando que la fecha sea válida
                fecha_valor = fecha.get("fecha")
                hora_valor = fecha.get("hora") if "hora" in fecha else None

                if fecha_valor:
                    calendar_repo.create_event(
                        document_id=document.id,
                        event=evento,
                        date=fecha_valor,
                        time=hora_valor
                    )

            # 11. Actualizar la caché para este documento
            update_cache_for_document(file_path, doc_unique_hash, entities, version_hash, spelling_errors)

            print(f"✅ Documento procesado correctamente: {file_path}")

    return {"success": True, "message": "Sincronización completada."}