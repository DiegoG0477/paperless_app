# use_cases.py
from data.database import get_db_session
from models.models import Document, Version
import datetime

def create_document(title, description, doc_type, unique_hash):
    """
    Caso de uso para crear un nuevo documento.
    Se encarga de:
      - Validar y normalizar datos (si es necesario).
      - Insertar el documento en la base de datos.
    """
    session = get_db_session()
    try:
        new_doc = Document(
            title=title,
            description=description,
            type=doc_type,
            unique_hash=unique_hash,
            created_at=datetime.datetime.utcnow()
        )
        session.add(new_doc)
        session.commit()
        session.refresh(new_doc)
        return new_doc
    except Exception as e:
        session.rollback()
        raise e
    finally:
        session.close()

def add_version(document_id, version_tag, file_path, file_hash, author_id, comment):
    """
    Caso de uso para agregar una nueva versión a un documento existente.
    Se encarga de:
      - Verificar cambios (mediante comparación de hash, etc.).
      - Insertar la nueva versión en la base de datos.
    """
    session = get_db_session()
    try:
        new_version = Version(
            document_id=document_id,
            version_tag=version_tag,
            file_path=file_path,
            file_hash=file_hash,
            author_id=author_id,
            comment=comment,
            updated_at=datetime.datetime.utcnow()
        )
        session.add(new_version)
        session.commit()
        session.refresh(new_version)
        return new_version
    except Exception as e:
        session.rollback()
        raise e
    finally:
        session.close()
