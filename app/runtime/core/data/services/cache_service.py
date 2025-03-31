from diskcache import Cache
from pathlib import Path
import threading
from config.config import get_base_directory
import json
from datetime import datetime

# Definir la ruta para la caché persistente
base_dir = get_base_directory()
CACHE_DIR = base_dir / "cache"
CACHE_DIR.mkdir(parents=True, exist_ok=True)

# Inicializar las cachés separadas para cada tipo de dato
document_cache = Cache(str(CACHE_DIR / "documents"))
version_cache = Cache(str(CACHE_DIR / "versions"))
analyzed_cache = Cache(str(CACHE_DIR / "analyzed"))
spelling_cache = Cache(str(CACHE_DIR / "spelling"))
suggestions_cache = Cache(str(CACHE_DIR / "suggestions"))

def datetime_handler(obj):
    """Handler para serializar objetos datetime"""
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError(f"Object of type {type(obj)} is not JSON serializable")

# Métodos para Documents
def cache_document(document):
    """Guarda un documento en la caché"""
    # Guardar por ID y por unique_hash
    document_data = {
        "id": document.id,
        "title": document.title,
        "description": document.description,
        "type": document.type,
        "unique_hash": document.unique_hash,
        "main_path": document.main_path,
        "created_at": json.dumps(document.created_at, default=datetime_handler)
    }
    document_cache[f"id:{document.id}"] = document_data
    document_cache[f"hash:{document.unique_hash}"] = document_data
    return document_data

def get_cached_document_by_id(document_id):
    """Obtiene un documento de la caché por ID"""
    return document_cache.get(f"id:{document_id}")

def get_cached_document_by_hash(unique_hash):
    """Obtiene un documento de la caché por hash"""
    return document_cache.get(f"hash:{unique_hash}")

# Métodos para Versions
def cache_version(version):
    """Guarda una versión en la caché"""
    version_data = {
        "id": version.id,
        "document_id": version.document_id,
        "version_tag": version.version_tag,
        "file_path": version.file_path,
        "file_hash": version.file_hash,
        "author_id": version.author_id,
        "comment": version.comment,
        "size_mb": float(version.size_mb) if version.size_mb else 0.0,
        "updated_at": json.dumps(version.updated_at, default=datetime_handler)
    }
    # Guardar la versión individual
    version_cache[f"id:{version.id}"] = version_data
    
    # Actualizar lista de versiones del documento
    doc_versions_key = f"doc:{version.document_id}:versions"
    current_versions = version_cache.get(doc_versions_key, [])
    current_versions.append(version_data)
    # Ordenar por updated_at descendente
    current_versions.sort(key=lambda x: x["updated_at"], reverse=True)
    version_cache[doc_versions_key] = current_versions
    
    return version_data

def get_cached_version_by_id(version_id):
    """Obtiene una versión de la caché por ID"""
    return version_cache.get(f"id:{version_id}")

def get_cached_versions_by_document_id(document_id):
    """Obtiene todas las versiones de un documento de la caché"""
    return version_cache.get(f"doc:{document_id}:versions", [])

def get_cached_latest_version_by_document_id(document_id):
    """Obtiene la última versión de un documento de la caché"""
    versions = get_cached_versions_by_document_id(document_id)
    return versions[0] if versions else None

# Métodos para AnalyzedContent
def cache_analyzed_content(analyzed_content):
    """Guarda contenido analizado en la caché"""
    content_data = {
        "version_id": analyzed_content.version_id,
        "text": analyzed_content.text,
        "entities": analyzed_content.entities
    }
    analyzed_cache[f"version:{analyzed_content.version_id}"] = content_data
    return content_data

def get_cached_analyzed_content_by_version_id(version_id):
    """Obtiene contenido analizado de la caché por ID de versión"""
    return analyzed_cache.get(f"version:{version_id}")

# Métodos para SpellingErrors
def cache_spelling_errors(version_id, errors):
    """Guarda errores ortográficos en la caché"""
    spelling_cache[f"version:{version_id}"] = errors
    return errors

def get_cached_spelling_errors_by_version_id(version_id):
    """Obtiene errores ortográficos de la caché por ID de versión"""
    return spelling_cache.get(f"version:{version_id}", [])

# Métodos para limpiar la caché
def clear_all_caches():
    """Limpia todas las cachés"""
    document_cache.clear()
    version_cache.clear()
    analyzed_cache.clear()
    spelling_cache.clear()
    suggestions_cache.clear() 

def clear_document_cache(document_id):
    """Limpia la caché de un documento específico y sus datos relacionados"""
        # Obtener todas las versiones del documento
    versions = get_cached_versions_by_document_id(document_id)
    
    # Limpiar documento
    document_cache.pop(f"id:{document_id}", None)
    
    # Limpiar versiones y datos relacionados
    for version in versions:
        version_id = version["id"]
        version_cache.pop(f"id:{version_id}", None)
        analyzed_cache.pop(f"version:{version_id}", None)
        spelling_cache.pop(f"version:{version_id}", None)
    
    # Limpiar lista de versiones del documento
    version_cache.pop(f"doc:{document_id}:versions", None)

def cache_document_list(documents):
    """Guarda la lista completa de documentos en la caché"""
    #with document_lock:
        # Guardar la lista completa
    document_list = [cache_document(doc) for doc in documents]
    document_cache["all_documents"] = document_list
    return document_list

def get_all_cached_documents():
    """
    Obtiene la lista completa de documentos de la caché.
    Retorna una lista vacía si no hay documentos cacheados.
    """
    try:
        cached_docs = document_cache.get("all_documents")
        return cached_docs if cached_docs is not None else []
    except Exception as e:
        print(f"Error al obtener documentos de caché: {e}")
        return []
    
def cache_word_suggestions(word: str, suggestions: list):
    """Guarda las sugerencias para una palabra en la caché"""
    suggestions_cache[f"word:{word}"] = suggestions
    return suggestions

def get_cached_word_suggestions(word: str):
    """Obtiene las sugerencias cacheadas para una palabra"""
    return suggestions_cache.get(f"word:{word}")
