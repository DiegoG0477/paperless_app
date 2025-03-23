# /app/runtime/core/use_cases/process_document_metadata.py
from core.data.services.metadata_extractor import extract_metadata

class ProcessDocumentMetadataUseCase:
    def execute(self, file_path: str):
        """
        Procesa un documento extrayendo sus metadatos relevantes.
        Retorna un diccionario con:
          - title
          - author
          - created (fecha de creación)
          - modified (fecha de modificación)
          - description
          - size_mb (tamaño en megabytes)
        """
        try:
            metadata = extract_metadata(file_path)
            # Aquí podrías agregar pasos adicionales, como normalizar las fechas.
            return {"success": True, "metadata": metadata}
        except Exception as e:
            return {"success": False, "error": str(e)}

# Ejemplo de uso:
# use_case = ProcessDocumentMetadataUseCase()
# result = use_case.execute("ruta/al/archivo.pdf")
# if result["success"]:
#     print(result["metadata"])
