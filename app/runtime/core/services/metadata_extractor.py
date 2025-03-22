# metadata_extractor.py
import re
from pdfminer.pdfparser import PDFParser
from pdfminer.pdfdocument import PDFDocument
from docx import Document

def extract_pdf_metadata(file_path):
    """Extrae metadatos de un archivo PDF."""
    metadata = {}
    with open(file_path, 'rb') as f:
        parser = PDFParser(f)
        doc = PDFDocument(parser)
        if hasattr(doc, 'info') and doc.info:
            # doc.info es una lista de diccionarios
            info = doc.info[0]
            metadata = {k.decode() if isinstance(k, bytes) else k: 
                        v.decode() if isinstance(v, bytes) else v for k, v in info.items()}
    return metadata

def extract_docx_metadata(file_path):
    """Extrae metadatos de un archivo DOCX."""
    doc = Document(file_path)
    core_props = doc.core_properties
    metadata = {
        "title": core_props.title,
        "author": core_props.author,
        "created": core_props.created.isoformat() if core_props.created else None,
        "modified": core_props.modified.isoformat() if core_props.modified else None
    }
    return metadata

def extract_metadata(file_path):
    """Detecta el tipo de archivo y extrae metadatos correspondientes."""
    ext = Path(file_path).suffix.lower()
    if ext == ".pdf":
        return extract_pdf_metadata(file_path)
    elif ext in [".docx", ".doc"]:
        return extract_docx_metadata(file_path)
    else:
        raise ValueError(f"Formato no soportado para metadatos: {ext}")

# Caso de uso:
# metadata = extract_metadata("ruta/al/archivo.pdf")
# Luego se pueden normalizar y guardar en la BD.
