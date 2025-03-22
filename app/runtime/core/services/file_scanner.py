# file_scanner.py
import os
from pathlib import Path
from pdfminer.high_level import extract_text as extract_text_from_pdf
from docx import Document
import pytesseract
from PIL import Image

def is_scanned_pdf(file_path):
    """
    Método simplificado que intenta determinar si un PDF es escaneado
    (por ejemplo, si el texto extraído es muy corto).
    """
    text = extract_text_from_pdf(file_path)
    return len(text.strip()) < 10  # Si es muy corto, asumimos que es escaneado

def extract_text_from_docx(file_path):
    """Extrae texto de un archivo DOCX."""
    doc = Document(file_path)
    full_text = []
    for para in doc.paragraphs:
        full_text.append(para.text)
    return "\n".join(full_text)

def extract_text_with_ocr(file_path):
    """
    Usa Tesseract OCR para extraer texto de un archivo de imagen o PDF escaneado.
    Se asume que el PDF se puede convertir a imagen o se trata de una imagen.
    """
    # Por simplicidad, asumiremos que se le pasa una imagen; para PDF, podrías convertir cada página a imagen.
    image = Image.open(file_path)
    return pytesseract.image_to_string(image, lang='spa')  # Configurado para español

def scan_file(file_path):
    """
    Escanea un archivo y extrae su texto.
    Dependiendo de la extensión y de la detección, utiliza el método adecuado.
    """
    ext = Path(file_path).suffix.lower()
    if ext == ".pdf":
        if is_scanned_pdf(file_path):
            print("PDF escaneado: se aplicará OCR")
            text = extract_text_with_ocr(file_path)
        else:
            text = extract_text_from_pdf(file_path)
    elif ext in [".docx", ".doc"]:
        text = extract_text_from_docx(file_path)
    else:
        raise ValueError(f"Formato de archivo no soportado: {ext}")
    
    return text

# Caso de uso:
# file_text = scan_file("ruta/al/archivo.pdf")
# Luego, este texto se pasa al servicio de extracción de metadatos o al de detección de entidades.
