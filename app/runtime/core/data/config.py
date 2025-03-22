import os
from pathlib import Path

def get_env():
    """ Devuelve el entorno actual de la aplicación (DEV o PROD) """
    return os.getenv("APP_ENV", "DEV").upper()

def get_base_directory():
    """ Devuelve la ruta base donde se almacenan los datos de la aplicación según el entorno """
    env = get_env()
    
    if env == "DEV":
        return Path(__file__).resolve().parent.parent.parent / "storage" / "paperless_db"
    else:
        if os.name == 'nt': 
            return Path(os.getenv("APPDATA")) / "Paperless"
        else:
            return Path.home() / ".config" / "paperless"

def get_db_path():
    """ Devuelve la ruta de la base de datos SQLite """
    base_dir = get_base_directory()
    base_dir.mkdir(parents=True, exist_ok=True)
    return base_dir / "paperless.db"

def get_template_db_path():
    """ Devuelve la ruta del template de la base de datos (si existe) """
    return Path(__file__).resolve().parent / "template.db"

def get_init_sql_path():
    """ Devuelve la ruta del archivo init.sql """
    return Path(__file__).resolve().parent / "init.sql"
