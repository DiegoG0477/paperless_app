import sys
from app.runtime.bridge import python_adapter

def main():
    # Inicializa el núcleo del backend, carga configuraciones, etc.
    # Por ejemplo, inicializar base de datos, cargar servicios, etc.
    
    # Ejecuta el adapter para recibir mensajes desde Electron
    python_adapter.run_adapter()

if __name__ == '__main__':
    main()