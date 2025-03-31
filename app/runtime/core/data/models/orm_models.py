# /app/runtime/data/models/orm_models.py
import datetime
from sqlalchemy import JSON, Column, String, Integer, DateTime, ForeignKey, Text, Numeric, Date, Time
from sqlalchemy.orm import relationship, declarative_base
from core.domain.models.user import UserDomain
from core.domain.models.document import DocumentDomain
from core.domain.models.version import VersionDomain
from core.domain.models.spelling_error import SpellingErrorDomain
from core.domain.models.analyzed_content import AnalyzedContentDomain
from core.domain.models.legal_calendar import LegalCalendarDomain

Base = declarative_base()

class PersonalData(Base):
    __tablename__ = 'personal_data'
    id = Column(Integer, primary_key=True, autoincrement=True)
    first_name = Column(String(42), nullable=False)
    last_name = Column(String(42), nullable=False)

    # Relación 1:1 con User (un User tiene un PersonalData)
    user = relationship("User", back_populates="personal_data", uselist=False)
    # Relación 1:1 con Author (un Author tiene un PersonalData)
    author = relationship("Author", back_populates="personal_data", uselist=False)

class User(Base):
    __tablename__ = 'users'
    id = Column(String(32), primary_key=True)
    email = Column(String(42), unique=True, nullable=False)
    password_hash = Column(String(72), nullable=False)
    registered_at = Column(DateTime, default=datetime.datetime.utcnow)
    personal_data_id = Column(Integer, ForeignKey('personal_data.id'))
    
    # Relaciones
    personal_data = relationship("PersonalData", back_populates="user", uselist=False)
    authors = relationship("Author", back_populates="user")

class Author(Base):
    __tablename__ = 'authors'
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(32), ForeignKey('users.id'))  # Corregir a String(32)
    personal_data_id = Column(Integer, ForeignKey('personal_data.id'), nullable=False)
    
    # Relaciones
    user = relationship("User", back_populates="authors")
    personal_data = relationship("PersonalData", back_populates="author")

class Settings(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    main_path = Column(Text, nullable=False)

class Document(Base):
    __tablename__ = 'documents'
    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    description = Column(String(500))
    type = Column(String(32))
    unique_hash = Column(String(255), unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    main_path = Column(Text)
    
    versions = relationship("Version", back_populates="document", cascade="all, delete")
    legal_events = relationship("LegalCalendar", back_populates="document", cascade="all, delete")

    def to_domain(self):
        return DocumentDomain(
            id=self.id,
            title=self.title,
            description=self.description,
            doc_type=self.type,
            unique_hash=self.unique_hash,
            created_at=self.created_at,
            main_path=self.main_path
        )

class Version(Base):
    __tablename__ = 'versions'
    id = Column(Integer, primary_key=True, autoincrement=True)
    document_id = Column(Integer, ForeignKey('documents.id'), nullable=False)
    version_tag = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_hash = Column(String(255), unique=True, nullable=False)
    author_id = Column(Integer, ForeignKey('authors.id'), nullable=False)
    comment = Column(String(500))
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)
    size_mb = Column(Numeric)
   
    document = relationship("Document", back_populates="versions")
    analyzed_content = relationship("AnalyzedContent", uselist=False, back_populates="version")
    spell_errors = relationship("SpellErrors", back_populates="version")

    author = relationship("Author", backref="versions")

    def to_domain(self):
        return VersionDomain(
            id=self.id,
            document_id=self.document_id,
            version_tag=self.version_tag,
            file_path=self.file_path,
            file_hash=self.file_hash,
            author_id=self.author_id,
            comment=self.comment,
            updated_at=self.updated_at,
            size_mb=float(self.size_mb) if self.size_mb is not None else 0.0
        )
    
class SpellErrors(Base):
    __tablename__ = "spell_errors"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    word = Column(String, nullable=False)
    version_id = Column(Integer, ForeignKey("versions.id"), nullable=False)

    version = relationship("Version", back_populates="spell_errors")

    def to_domain(self):
        return SpellingErrorDomain(
            error_id=self.id,
            word=self.word,
            version_id=self.version_id
        )

class AnalyzedContent(Base):
    """
    Modelo ORM para la tabla analyzed_content.
    Almacena el texto analizado y las entidades detectadas para cada versión de documento.
    """
    __tablename__ = "analyzed_content"

    version_id = Column(Integer, ForeignKey("versions.id"), primary_key=True)
    text = Column(Text, nullable=False)
    entities = Column(JSON, nullable=False, default={})

    # Relación con la tabla versions
    version = relationship("Version", back_populates="analyzed_content")

    def to_domain(self):
        return AnalyzedContentDomain(
            version_id=self.version_id,
            text=self.text,
            entities=self.entities
        )

class LegalCalendar(Base):
    """
    Modelo ORM para la tabla legal_calendar.
    Almacena eventos legales detectados en los documentos.
    """
    __tablename__ = "legal_calendar"

    id = Column(Integer, primary_key=True, autoincrement=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    event = Column(String, nullable=False)
    date = Column(Date, nullable=False)
    time = Column(Time, nullable=True)  # Puede ser NULL si no se detecta hora.

    # Relación con la tabla documents
    document = relationship("Document", back_populates="legal_events")

    def to_domain(self):
        return LegalCalendarDomain(
            event_id=self.id,
            document_id=self.document_id,
            event=self.event,
            date=self.date,
            time=self.time
        )