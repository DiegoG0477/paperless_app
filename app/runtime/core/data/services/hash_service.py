import hashlib
from core.data.services.metadata_extractor import extract_metadata

def calculate_unique_hash(file_path, main_path):
    """
    Genera un hash único para el documento basado en la ruta principal y la fecha de creación.
    Si no se encuentra la fecha de creación, usa el hash del contenido como fallback.
    """
    metadata = extract_metadata(file_path)
    created_at = metadata.get("created")

    if created_at:
        unique_data = f"{main_path}_{created_at}"
    else:
        # Fallback: si no hay metadata confiable, usa el hash de contenido como unique_hash
        unique_data = calculate_file_hash(file_path)

    return hashlib.sha256(unique_data.encode()).hexdigest()

def calculate_version_hash(file_path):
    """
    Genera el hash de la versión basado en el contenido y metadatos del documento.
    Esto cambia cada vez que el documento es modificado.
    """
    metadata = extract_metadata(file_path)
    modified_at = metadata.get("modified", "unknown")

    # Se calcula el hash del contenido
    file_content_hash = calculate_file_hash(file_path)

    version_data = f"{file_content_hash}_{modified_at}"
    return hashlib.sha256(version_data.encode()).hexdigest()

def calculate_file_hash(file_path):
    """
    Calcula el hash SHA-256 del contenido del archivo.
    """
    sha256 = hashlib.sha256()
    with open(file_path, 'rb') as f:
        for block in iter(lambda: f.read(4096), b""):
            sha256.update(block)
    return sha256.hexdigest()
