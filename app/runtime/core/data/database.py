import os
import sqlite3
import shutil
from pathlib import Path

def get_db_path():
    env = os.environ.get("APP_ENV", "DEV")
    
    if env.upper() == "DEV":
        base_dir = Path(__file__).resolve().parent.parent.parent / "storage" / "paperless_db"
    else:
        if os.name == 'nt':  # Windows
            base_dir = Path(os.getenv("APPDATA")) / "Paperless"
        else:
            base_dir = Path.home() / ".config" / "paperless"
    
    base_dir.mkdir(parents=True, exist_ok=True)
    return base_dir / "paperless.db"

def initialize_database():
    db_path = get_db_path()
    print(f"Buscando base de datos en: {db_path}")

    if not db_path.exists():
        # Si tienes un template, intenta copiarlo (opcional)
        template_path = Path(__file__).resolve().parent / "data" / "template.db"
        if template_path.exists():
            shutil.copy(template_path, db_path)
            print(f"Base de datos copiada desde la plantilla a {db_path}")
        else:
            # Leer y ejecutar init.sql
            init_sql_path = Path(__file__).resolve().parent / "data" / "init.sql"
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

if __name__ == "__main__":
    initialize_database()