from datetime import date, time

class LegalCalendarDomain:
    """
    Modelo de dominio para eventos legales extraídos del documento.
    """

    def __init__(self, document_id: int, event: str, date: date, time: time = None):
        self.document_id = document_id
        self.event = event
        self.date = date
        self.time = time

    def to_dict(self):
        """Convierte el modelo de dominio a un diccionario."""
        return {
            "document_id": self.document_id,
            "event": self.event,
            "date": self.date.strftime("%Y-%m-%d"),
            "time": self.time.strftime("%H:%M:%S") if self.time else None
        }