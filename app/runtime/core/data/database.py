from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import shutil
from config import get_db_path, get_template_db_path
from models import Base  # Asegúrate de tener tus modelos definidos en models.py
from pathlib import Path

def get_database_url():
    """
    Construye la URL de conexión para SQLite usando la ruta definida.
    """
    db_path = get_db_path()
    return f"sqlite:///{db_path}"

# Crear el engine con la URL de la base de datos.
engine = create_engine(get_database_url(), echo=False, connect_args={"check_same_thread": False})

# Configurar la sesión.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def initialize_database():
    """
    Inicializa la base de datos:
      - Si el archivo no existe, intenta copiar un template (opcional).
      - Sino, se procede a crear (o actualizar) las tablas usando SQLAlchemy.
    """
    db_path = get_db_path()
    print(f"Buscando base de datos en: {db_path}")
    
    if not db_path.exists():
        template_path = get_template_db_path()
        if template_path.exists():
            shutil.copy(template_path, db_path)
            print(f"Base de datos copiada desde la plantilla a {db_path}")
        else:
            print("No se encontró template; se creará la base de datos usando SQLAlchemy.")
    else:
        print("La base de datos ya existe. Se procederá a actualizar el esquema si es necesario.")
    
    # Crear (o actualizar) las tablas definidas en Base.metadata.
    Base.metadata.create_all(bind=engine)
    print("Inicialización de la base de datos completada.")

def get_db_session():
    """
    Retorna una sesión activa para interactuar con la base de datos.
    """
    return SessionLocal()

if __name__ == "__main__":
    initialize_database()