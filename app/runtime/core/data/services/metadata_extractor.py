import re
from pathlib import Path
from pdfminer.pdfparser import PDFParser
from pdfminer.pdfdocument import PDFDocument
from docx import Document

def extract_pdf_metadata(file_path):
    """Extrae metadatos relevantes de un archivo PDF."""
    metadata = {}
    with open(file_path, 'rb') as f:
        parser = PDFParser(f)
        doc = PDFDocument(parser)
        if hasattr(doc, 'info') and doc.info:
            # Se toma el primer diccionario de metadatos
            info = doc.info[0]
            metadata['title'] = info.get(b'/Title', b'').decode('utf-8', errors='ignore') if info.get(b'/Title') else ""
            metadata['author'] = info.get(b'/Author', b'').decode('utf-8', errors='ignore') if info.get(b'/Author') else ""
            metadata['created'] = info.get(b'/CreationDate', b'').decode('utf-8', errors='ignore') if info.get(b'/CreationDate') else ""
            metadata['modified'] = info.get(b'/ModDate', b'').decode('utf-8', errors='ignore') if info.get(b'/ModDate') else ""
            # Usamos /Subject como descripción, si existe.
            metadata['description'] = info.get(b'/Subject', b'').decode('utf-8', errors='ignore') if info.get(b'/Subject') else ""
    # Agregar tamaño en MB
    size_bytes = Path(file_path).stat().st_size
    metadata['size_mb'] = round(size_bytes / (1024 * 1024), 2)
    return metadata

def extract_docx_metadata(file_path):
    """Extrae metadatos relevantes de un archivo DOCX."""
    doc = Document(file_path)
    core_props = doc.core_properties
    metadata = {
        "title": core_props.title if core_props.title else "",
        "author": core_props.author if core_props.author else "",
        "created": core_props.created.isoformat() if core_props.created else "",
        "modified": core_props.modified.isoformat() if core_props.modified else "",
        "description": "",  # No existe un campo estándar de descripción en docx; se deja vacío.
    }
    # Agregar tamaño en MB
    size_bytes = Path(file_path).stat().st_size
    metadata["size_mb"] = round(size_bytes / (1024 * 1024), 2)
    return metadata

def extract_metadata(file_path):
    """
    Detecta el tipo de archivo y extrae los metadatos relevantes:
    title, author, created, modified, description y size_mb.
    """
    ext = Path(file_path).suffix.lower()
    if ext == ".pdf":
        return extract_pdf_metadata(file_path)
    elif ext in [".docx", ".doc"]:
        return extract_docx_metadata(file_path)
    else:
        raise ValueError(f"Formato no soportado para metadatos: {ext}")

# Ejemplo de uso:
# metadata = extract_metadata("ruta/al/archivo.pdf")