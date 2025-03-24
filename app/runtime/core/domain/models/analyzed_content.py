class AnalyzedContentDomain:
    """
    Modelo de dominio para el contenido analizado de un documento.
    """
    def __init__(self, version_id: int, text: str, entities: dict):
        self.version_id = version_id
        self.text = text
        self.entities = entities

    def to_dict(self):
        """Convierte el modelo de dominio a un diccionario."""
        return {
            "version_id": self.version_id,
            "text": self.text,
            "entities": self.entities
        }