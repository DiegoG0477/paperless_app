import os
import platform

def get_data_directory():
    if platform.system() == "Windows":
        base_path = os.getenv("APPDATA")
    else:
        # En Linux o macOS, se recomienda usar ~/.config/nombre_app o similar
        base_path = os.path.join(os.path.expanduser("~"), ".config")
    
    # Define el directorio específico de tu aplicación
    data_dir = os.path.join(base_path, "paperless")
    
    # Crea el directorio si no existe
    os.makedirs(data_dir, exist_ok=True)
    return data_dir

# Ejemplo de uso:
if __name__ == '__main__':
    print("Directorio de datos:", get_data_directory())
