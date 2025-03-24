# /app/runtime/core/data/services/cache_service.py
from diskcache import Cache
from pathlib import Path
import threading

# Definir la ruta para la caché persistente.
# Por ejemplo, en DEV se puede usar un directorio local, en PROD uno en appdata o similar.
CACHE_DIR = Path(__file__).resolve().parent.parent.parent / "storage" / "cache"
CACHE_DIR.mkdir(parents=True, exist_ok=True)

# Inicializar la caché
cache = Cache(str(CACHE_DIR))

# Lock para operaciones críticas (si se necesitan)
cache_lock = threading.Lock()

def update_cache_for_document(file_path, unique_hash, entities, version_hash=None, spelling_errors=None):
    """
    Actualiza o crea la entrada en la caché persistente para un documento.
    Los datos se almacenan en disco.
    """
    with cache_lock:
        cache[file_path] = {
            "unique_hash": unique_hash,
            "version_hash": version_hash,
            "entities": entities,
            "file_path": file_path,
            "spelling_errors": spelling_errors
        }

def get_cached_document(file_path):
    """
    Retorna la entrada de la caché persistente para el documento dado, o None si no existe.
    """
    with cache_lock:
        return cache.get(file_path, None)

def clear_cache():
    """
    Limpia la caché persistente.
    """
    with cache_lock:
        cache.clear()

# Ejemplo de uso
if __name__ == '__main__':
    test_path = "C:/documentos/ejemplo.pdf"
    update_cache_for_document(
        test_path,
        unique_hash="unique123",
        entities={"personas": [{"nombre": "Juan Pérez", "rol": "demandante", "tipo": "física"}]},
        version_hash="version456",
        spelling_errors=[{"word": "errore", "suggestions": ["error"]}]
    )
    cached = get_cached_document(test_path)
    print("Cached data:", cached)
