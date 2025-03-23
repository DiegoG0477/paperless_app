import os
from pathlib import Path
import pytesseract
from pdfminer.high_level import extract_text as extract_text_from_pdf
from pdfminer.pdfparser import PDFSyntaxError
from pdf2image import convert_from_path
from docx import Document
from PIL import Image

# Configurar Tesseract OCR
if os.name == 'nt':
    pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
else:
    # En Linux y macOS, Tesseract suele estar en el PATH
    pytesseract.pytesseract.tesseract_cmd = "tesseract"

def is_scanned_pdf(file_path):
    """
    Determina si un PDF es escaneado revisando si el texto extraído es muy corto.
    También detecta si hay imágenes en el documento.
    """
    try:
        text = extract_text_from_pdf(file_path)
        return len(text.strip()) < 10  # Si el texto extraído es muy corto, probablemente sea un PDF escaneado
    except PDFSyntaxError:
        return True  # Si hay un error en el parsing, puede ser un escaneado o corrupto

def extract_text_from_docx(file_path):
    """Extrae texto de un archivo DOCX y detecta imágenes."""
    doc = Document(file_path)
    full_text = []
    contains_images = False

    for para in doc.paragraphs:
        full_text.append(para.text)

    # Buscar imágenes en el DOCX
    for rel in doc.part.rels:
        if "image" in doc.part.rels[rel].target_ref:
            contains_images = True
            full_text.append("{IMAGEN}")  # Opcional: indicar dónde había una imagen

    return "\n".join(full_text), contains_images

def extract_text_with_ocr(image_path):
    """
    Usa Tesseract OCR para extraer texto de una imagen.
    """
    image = Image.open(image_path)
    return pytesseract.image_to_string(image, lang='spa')  # OCR en español

def extract_text_from_pdf_with_ocr(file_path):
    """
    Convierte cada página de un PDF en imagen y extrae su texto con OCR.
    """
    pages = convert_from_path(file_path)  # Convierte el PDF en imágenes
    ocr_text = []
    for page in pages:
        text = pytesseract.image_to_string(page, lang='spa')
        ocr_text.append(text)
    return "\n".join(ocr_text)

def scan_file(file_path):
    """
    Escanea un archivo y extrae su texto.
    Si se detectan imágenes, aplica OCR para extraer el texto de ellas.
    """
    ext = Path(file_path).suffix.lower()
    extracted_text = ""

    if ext == ".pdf":
        if is_scanned_pdf(file_path):
            print("📄 PDF escaneado: se aplicará OCR")
            extracted_text = extract_text_from_pdf_with_ocr(file_path)
        else:
            extracted_text = extract_text_from_pdf(file_path)

    elif ext in [".docx", ".doc"]:
        extracted_text, contains_images = extract_text_from_docx(file_path)

        if contains_images:
            print("📄 DOCX contiene imágenes: aplicando OCR")
            # Extraer imágenes del DOCX y procesarlas con OCR
            extracted_text += "\n" + extract_images_and_apply_ocr(file_path)

    else:
        raise ValueError(f"❌ Formato de archivo no soportado: {ext}")

    return extracted_text

def extract_images_and_apply_ocr(docx_path):
    """
    Extrae imágenes de un archivo DOCX y aplica OCR.
    """
    from zipfile import ZipFile
    import tempfile

    ocr_text = []
    with ZipFile(docx_path, "r") as docx_zip:
        with tempfile.TemporaryDirectory() as temp_dir:
            for file in docx_zip.namelist():
                if file.startswith("word/media/") and file.endswith((".png", ".jpg", ".jpeg")):
                    extracted_path = os.path.join(temp_dir, os.path.basename(file))
                    with open(extracted_path, "wb") as img_file:
                        img_file.write(docx_zip.read(file))

                    text = extract_text_with_ocr(extracted_path)
                    ocr_text.append(text)

    return "\n".join(ocr_text)