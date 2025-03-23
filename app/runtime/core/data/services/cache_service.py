# cache_service.py
import hashlib
from functools import lru_cache

# O bien, una caché global (simplificada)
hash_cache = {}

def calculate_file_hash(file_path):
    sha256 = hashlib.sha256()
    with open(file_path, 'rb') as f:
        for block in iter(lambda: f.read(4096), b""):
            sha256.update(block)
    return sha256.hexdigest()

def get_cached_hash(file_path):
    """Retorna el hash del archivo si ya fue calculado, o lo calcula y lo almacena."""
    if file_path in hash_cache:
        return hash_cache[file_path]
    else:
        h = calculate_file_hash(file_path)
        hash_cache[file_path] = h
        return h

def clear_hash_cache():
    """Limpia la caché."""
    hash_cache.clear()

# Caso de uso:
# hash_actual = get_cached_hash("ruta/al/archivo.pdf")
