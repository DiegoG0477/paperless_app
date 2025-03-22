# database.py
import sqlite3
import shutil
from config import get_db_path, get_template_db_path, get_init_sql_path

def initialize_database():
    """
    Verifica la existencia de la base de datos, copia un template si existe,
    o ejecuta init.sql para crear la estructura en caso de que no exista.
    """
    db_path = get_db_path()
    print(f"Buscando base de datos en: {db_path}")

    if not db_path.exists():
        template_path = get_template_db_path()
        if template_path.exists():
            shutil.copy(template_path, db_path)
            print(f"Base de datos copiada desde la plantilla a {db_path}")
        else:
            init_sql_path = get_init_sql_path()
            if not init_sql_path.exists():
                raise FileNotFoundError("No se encontró el archivo de inicialización init.sql.")
            
            conn = sqlite3.connect(str(db_path))
            with open(init_sql_path, "r", encoding="utf-8") as f:
                sql_script = f.read()
            conn.executescript(sql_script)
            conn.commit()
            conn.close()
            print(f"Base de datos creada e inicializada en {db_path}")
    else:
        print("La base de datos ya existe.")

def get_db_connection():
    """
    Retorna una conexión activa a la base de datos.
    """
    return sqlite3.connect(str(get_db_path()))

if __name__ == "__main__":
    initialize_database()