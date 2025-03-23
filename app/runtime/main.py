import sys
import os

# Agregar la ruta del proyecto a sys.path
#PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../..'))
#sys.path.insert(0, PROJECT_ROOT)


from bridge import python_adapter

def main():
    # Inicializa el núcleo del backend, carga configuraciones, etc.
    # Por ejemplo, inicializar base de datos, cargar servicios, etc.
    
    # Ejecuta el adapter para recibir mensajes desde Electron
    python_adapter.run_adapter()

if __name__ == '__main__':
    main()