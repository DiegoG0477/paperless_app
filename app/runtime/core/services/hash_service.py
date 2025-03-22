# hash_service.py
import hashlib

def calculate_file_hash(file_path):
    """Calcula el hash SHA-256 de un archivo."""
    sha256 = hashlib.sha256()
    with open(file_path, 'rb') as f:
        for block in iter(lambda: f.read(4096), b""):
            sha256.update(block)
    return sha256.hexdigest()

def is_file_modified(file_path, previous_hash):
    """Compara el hash actual del archivo con uno previo."""
    current_hash = calculate_file_hash(file_path)
    return current_hash != previous_hash

# Caso de uso:
# new_hash = calculate_file_hash("ruta/al/archivo.pdf")
# if is_file_modified("ruta/al/archivo.pdf", stored_hash):
#     # Se crea una nueva versión
