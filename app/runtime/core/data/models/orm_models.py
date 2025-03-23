# /app/runtime/data/models/orm_models.py
import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship, declarative_base
from core.domain.models.user import UserDomain

Base = declarative_base()

class PersonalData(Base):
    __tablename__ = 'personal_data'
    id = Column(Integer, primary_key=True, autoincrement=True)
    first_name = Column(String(42), nullable=False)
    last_name = Column(String(42), nullable=False)

    author = relationship("Author", back_populates="personal_data", uselist=False)

class User(Base):
    __tablename__ = 'users'
    id = Column(String(32), primary_key=True)
    email = Column(String(42), unique=True, nullable=False)
    password_hash = Column(String(72), nullable=False)
    registered_at = Column(DateTime, default=datetime.datetime.utcnow)
    personal_data_id = Column(Integer, ForeignKey('personal_data.id'))
    personal_data = relationship("PersonalData", back_populates="user")
    authors = relationship("Author", back_populates="user")
    
    def to_domain(self):
        """
        Mapea este modelo ORM a un objeto de dominio (UserDomain).
        """
        # Se asume que personal_data puede ser None
        first_name = self.personal_data.first_name if self.personal_data else None
        last_name = self.personal_data.last_name if self.personal_data else None

        return UserDomain(
            user_id=self.id,
            email=self.email,
            password_hash=self.password_hash,
            registered_at=self.registered_at,
            first_name=first_name,
            last_name=last_name
        )

class Author(Base):
    __tablename__ = 'authors'
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    personal_data_id = Column(Integer, ForeignKey('personal_data.id'), nullable=False)

    personal_data = relationship("PersonalData", back_populates="author")

class Settings(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    main_path = Column(Text, nullable=False)

# class Document(Base):
#     __tablename__ = 'documents'
#     id = Column(Integer, primary_key=True, autoincrement=True)
#     title = Column(String(255), nullable=False)
#     description = Column(String(500))
#     type = Column(String(32))
#     unique_hash = Column(String(255), unique=True, nullable=False)
#     created_at = Column(DateTime, default=datetime.datetime.utcnow)
#     versions = relationship("Version", back_populates="document", cascade="all, delete")

# class Version(Base):
#     __tablename__ = 'versions'
#     id = Column(Integer, primary_key=True, autoincrement=True)
#     document_id = Column(Integer, ForeignKey('documents.id'), nullable=False)
#     version_tag = Column(String(255), nullable=False)
#     file_path = Column(String(500), nullable=False)
#     file_hash = Column(String(255), unique=True, nullable=False)
#     author_id = Column(Integer, ForeignKey('authors.id'), nullable=False)
#     comment = Column(String(500))
#     updated_at = Column(DateTime, default=datetime.datetime.utcnow)
#     document = relationship("Document", back_populates="versions")
#     analyzed_content = relationship("AnalyzedContent", uselist=False, back_populates="version")

# class AnalyzedContent(Base):
#     __tablename__ = 'analyzed_content'
#     version_id = Column(Integer, ForeignKey('versions.id'), primary_key=True)
#     text = Column(Text, nullable=False)
#     entities = Column(JSON, nullable=False, default={})
#     version = relationship("Version", back_populates="analyzed_content")

# class LegalCalendar(Base):
#     __tablename__ = 'legal_calendar'
#     id = Column(Integer, primary_key=True, autoincrement=True)
#     document_id = Column(Integer, ForeignKey('documents.id'), nullable=False)
#     event = Column(String, nullable=False)
#     date = Column(String, nullable=False)  # Podría ser Date si prefieres
#     time = Column(String)  # Podría ser Time