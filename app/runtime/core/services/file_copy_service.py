# file_copy_service.py
import os
import shutil
from pathlib import Path
from file_store import get_documents_directory

def copy_file_to_storage(src_file_path, document_id, version_tag):
    """
    Copia el archivo desde la ruta origen a la estructura interna:
    /<documents_directory>/<document_id>/<version_tag>_<filename>
    """
    dest_dir = Path(get_documents_directory()) / str(document_id)
    dest_dir.mkdir(parents=True, exist_ok=True)
    filename = Path(src_file_path).name
    dest_file_name = f"{version_tag}_{filename}"
    dest_file_path = dest_dir / dest_file_name
    shutil.copy(src_file_path, dest_file_path)
    return str(dest_file_path)

# Caso de uso:
# new_path = copy_file_to_storage("ruta/al/archivo.pdf", document_id=123, version_tag="v1.0")
# Luego, se registra esta ruta en la tabla versions de la BD.
