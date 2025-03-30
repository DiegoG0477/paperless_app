# /app/runtime/core/config.py
import os
from pathlib import Path

def get_env():
    """Devuelve el entorno actual de la aplicación (DEV o PROD)."""
    return os.getenv("APP_ENV", "DEV").upper()

def get_base_directory():
    """
    Devuelve la ruta base donde se almacenan los datos de la aplicación.
    - En DEV, usa la carpeta 'storage/paperless_db' del proyecto.
    - En PROD, usa:
         * Windows: %APPDATA%\Paperless
         * Linux: ~/.local/share/Paperless
         * macOS: ~/Library/Application Support/Paperless
    """
    env = get_env()
    if env == "DEV":
        # Ruta relativa en desarrollo
        return Path(__file__).resolve().parent.parent.parent.parent / "storage" / "data"
    else:
        if os.name == 'nt':  # Windows
            return Path(os.getenv("APPDATA")) / "Paperless"
        else:
            # Para Linux y macOS, se recomienda ~/.local/share o ~/Library/Application Support
            # Aquí usamos ~/.local/share como ejemplo para Linux y macOS
            return Path.home() / ".local" / "share" / "Paperless" / "data"

def get_db_path():
    """Devuelve la ruta de la base de datos SQLite."""
    base_dir = get_base_directory()
    base_dir.mkdir(parents=True, exist_ok=True)

    print(f"spuesto db path: {base_dir}/paperless.db")

    return base_dir / "paperless.db"

def get_template_db_path():
    """Devuelve la ruta del template de la base de datos (si existe)."""
    return Path(__file__).resolve().parent / "template.db"

def get_init_sql_path():
    """Devuelve la ruta del archivo init.sql."""
    return Path(__file__).resolve().parent / "resources" / "init.sql"