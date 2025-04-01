import re
from pathlib import Path
from datetime import datetime
from pdfminer.pdfparser import PDFParser
from pdfminer.pdfdocument import PDFDocument
from docx import Document

def normalize_date(date_str):
    """
    Convierte fechas de metadatos en formato estándar ISO `YYYY-MM-DD HH:MM:SS`.
    Si la fecha no es válida o está vacía, retorna None.
    """
    if not date_str:
        return None
    
    date_str = date_str.strip()
    
    # Manejo especial de formatos PDF (pueden traer D:20231231235959Z)
    pdf_date_match = re.match(r"D:(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})", date_str)
    if pdf_date_match:
        return f"{pdf_date_match.group(1)}-{pdf_date_match.group(2)}-{pdf_date_match.group(3)} " \
               f"{pdf_date_match.group(4)}:{pdf_date_match.group(5)}:{pdf_date_match.group(6)}"

    # Si es un formato estándar ISO, intentamos parsearlo
    try:
        parsed_date = datetime.fromisoformat(date_str)
        return parsed_date.strftime("%Y-%m-%d %H:%M:%S")
    except ValueError:
        return None  # Fecha inválida

def get_filename_as_title(file_path):
    """
    Extrae el nombre del archivo sin extensión para usarlo como título.
    
    Args:
        file_path (str): Ruta completa del archivo
        
    Returns:
        str: Nombre del archivo sin extensión
    """
    # Obtener el nombre del archivo con extensión (último componente después del último slash o backslash)
    filename = Path(file_path).name
    
    # Remover la extensión (.pdf, .docx, .doc)
    title = filename.rsplit('.', 1)[0]
    
    return title

def extract_pdf_metadata(file_path):
    """Extrae metadatos relevantes de un archivo PDF."""
    metadata = {}
    with open(file_path, 'rb') as f:
        parser = PDFParser(f)
        doc = PDFDocument(parser)
        if hasattr(doc, 'info') and doc.info:
            info = doc.info[0]
            metadata['title'] = info.get(b'/Title', b'').decode('utf-8', errors='ignore') if info.get(b'/Title') else ""
            metadata['author'] = info.get(b'/Author', b'').decode('utf-8', errors='ignore') if info.get(b'/Author') else "unkowmn"
            metadata['created'] = normalize_date(info.get(b'/CreationDate', b'').decode('utf-8', errors='ignore')) if info.get(b'/CreationDate') else None
            metadata['modified'] = normalize_date(info.get(b'/ModDate', b'').decode('utf-8', errors='ignore')) if info.get(b'/ModDate') else None
            metadata['description'] = info.get(b'/Subject', b'').decode('utf-8', errors='ignore') if info.get(b'/Subject') else ""

    if not metadata.get('title'):
        metadata['title'] = get_filename_as_title(file_path)

    # Si no se obtuvo fecha de creación, usamos la del sistema (fallback)
    if not metadata.get("created"):
        metadata["created"] = datetime.fromtimestamp(Path(file_path).stat().st_ctime).strftime("%Y-%m-%d %H:%M:%S")

    # Si no se obtuvo fecha de modificación, usamos la del sistema (fallback)
    if not metadata.get("modified"):
        metadata["modified"] = datetime.fromtimestamp(Path(file_path).stat().st_mtime).strftime("%Y-%m-%d %H:%M:%S")

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
        "author": core_props.author if core_props.author else "unkowmn",
        "created": normalize_date(core_props.created.isoformat()) if core_props.created else None,
        "modified": normalize_date(core_props.modified.isoformat()) if core_props.modified else None,
        "description": "",  # No existe un campo estándar de descripción en docx; se deja vacío.
    }

    if not metadata.get('title'):
        metadata['title'] = get_filename_as_title(file_path)

    # Si no se obtuvo fecha de creación, usamos la del sistema (fallback)
    if not metadata.get("created"):
        metadata["created"] = datetime.fromtimestamp(Path(file_path).stat().st_ctime).strftime("%Y-%m-%d %H:%M:%S")

    # Si no se obtuvo fecha de modificación, usamos la del sistema (fallback)
    if not metadata.get("modified"):
        metadata["modified"] = datetime.fromtimestamp(Path(file_path).stat().st_mtime).strftime("%Y-%m-%d %H:%M:%S")

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