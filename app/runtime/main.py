from bridge import python_adapter
#from bridge.event_handler import handle_get_documents
from core.usecases.sync_documents_use_case import migrate_to_cache

def main():
    # Ejecuta el adapter para recibir mensajes desde Electron
    #python_adapter.run_adapter()

    #result = handle_get_documents("empty")

    #sync_documents("/home/diego/Documentos/Paperless/sample")

    migrate_to_cache()

    #print(result)

if __name__ == '__main__':
    main()