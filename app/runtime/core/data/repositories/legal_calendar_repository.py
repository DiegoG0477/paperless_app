from sqlalchemy.orm import Session
from core.data.models.orm_models import LegalCalendar
from config.database import get_db_session
from datetime import datetime

class LegalCalendarRepository:
    """
    Repositorio para manejar eventos legales en la BD.
    """

    def __init__(self):
        self.session: Session = get_db_session()

    def create_event(self, document_id: int, event: str, date: str, time: str = None):
        """
        Crea un evento en el calendario legal asociado a un documento.
        """
        event_date = datetime.strptime(date, "%Y-%m-%d").date()
        event_time = datetime.strptime(time, "%H:%M").time() if time else None

        new_event = LegalCalendar(
            document_id=document_id,
            event=event,
            date=event_date,
            time=event_time
        )

        self.session.add(new_event)
        self.session.commit()

    def get_events_by_document(self, document_id: int):
        """
        Obtiene todos los eventos de un documento específico.
        """
        return self.session.query(LegalCalendar).filter_by(document_id=document_id).all()
