import sys
import os
from bridge import python_adapter
from core.data.services.entity_detection_service import configure_nlp

# Agregar la ruta del proyecto a sys.path
#PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../..'))
#sys.path.insert(0, PROJECT_ROOT)

def main():
    # Inicializa el núcleo del backend, carga configuraciones, etc.
    # Por ejemplo, inicializar base de datos, cargar servicios, etc.
    
    # Ejecuta el adapter para recibir mensajes desde Electron
    python_adapter.run_adapter()

    configure_nlp()

if __name__ == '__main__':
    main()