# file_store.py
import os
from pathlib import Path
from config import get_base_directory

def get_data_directory():
    """ Retorna la ruta base donde se almacenarán documentos y datos de la app """
    data_dir = get_base_directory()
    os.makedirs(data_dir, exist_ok=True)
    return data_dir

def get_documents_directory():
    """ Retorna la ruta donde se guardarán los documentos del usuario """
    documents_dir = get_data_directory() / "documents"
    os.makedirs(documents_dir, exist_ok=True)
    return documents_dir

def get_logs_directory():
    """ Retorna la ruta donde se almacenarán logs de la aplicación """
    logs_dir = get_data_directory() / "logs"
    os.makedirs(logs_dir, exist_ok=True)
    return logs_dir

if __name__ == '__main__':
    print("Directorio de datos:", get_data_directory())
    print("Directorio de documentos:", get_documents_directory())
    print("Directorio de logs:", get_logs_directory())