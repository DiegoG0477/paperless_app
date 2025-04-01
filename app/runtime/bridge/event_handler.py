# /app/runtime/bridge/event_handler.py
import time
import json
from datetime import datetime
from di.dependencies import (login_use_case, set_main_path_use_case, 
                             get_main_path, sync_documents_use_case,
                             get_documents_use_case)

class JSONEncoder(json.JSONEncoder):
    """Encoder personalizado para manejar fechas y otros tipos especiales"""
    def default(self, obj):
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)

def send_response(response):
    """
    Serializa y envía la respuesta de manera segura
    """
    try:
        # Serializar con el encoder personalizado
        json_str = json.dumps(response, cls=JSONEncoder)
        # Se imprime el JSON seguido de un salto de línea y haciendo flush para enviar un mensaje completo.
        print(json_str, flush=True)
        return True
    except Exception as e:
        error_response = {
            "event": "error",
            "data": {
                "message": f"Error serializando respuesta: {str(e)}",
                "original_event": response.get("event", "unknown")
            }
        }
        print(json.dumps(error_response), flush=True)
        return False


def handle_event(message):
    """
    Procesa los eventos recibidos desde el frontend.
    """
    command = message.get("command")
    
    if command == "ping":
        return {"event": "pong", "data": {"message": "Backend activo", "timestamp": time.time()}}

    elif command == "syncDocuments":
        return handle_sync_documents(message)
        #return {"event": "syncDocuments", "data": {"message": "Backend activo", "timestamp": time.time()}}

    elif command == "login":
        return handle_login(message)
    
    elif command == "setMainPath":
        return handle_set_main_path(message)
    
    elif command == "getDocuments":
        return handle_get_documents(message)

    else:
        return {"event": "error", "data": {"message": f"Comando desconocido: {command}"}}

def handle_login(message):
    """
    Maneja el login y delega al caso de uso.
    """
    data = message.get("data", {})
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return {"event": "loginFailure", "data": {"success": False, "error": "Faltan credenciales"}}

    result = login_use_case.execute(email, password)

    if result.get("success"):
        return {"event": "loginSuccess", "data": result}
    else:
        return {"event": "loginFailure", "data": result}
    

def handle_set_main_path(message):
    """
    Maneja el evento de establecer la ruta de escaneo.
    """
    data = message.get("data", {})
    new_path = data.get("path")

    if not new_path:
        return {"event": "setMainPathFailure", "data": {"success": False, "error": "Ruta no proporcionada"}}

    result = set_main_path_use_case.execute(new_path)

    if result.get("success"):
        return {"event": "setMainPathSuccess", "data": result}
    else:
        return {"event": "setMainPathFailure", "data": result}
    
def handle_sync_documents(message):
    """
    Maneja la sincronización de documentos.
    """
    try:
        # Obtener la ruta principal de la configuración
        #main_path = get_main_path()
        main_path = "home/diego/Documentos/Paperless/sample"
        
        if not main_path:
            return {
                "event": "syncFailure",
                "data": {
                    "success": False,
                    "error": "No se ha configurado una ruta principal"
                }
            }

        # Ejecutar la sincronización
        result = sync_documents_use_case(main_path)

        if result.get("success"):
            return {
                "event": "syncSuccess",
                "data": {
                    "success": True,
                    "message": result.get("message", "Sincronización completada"),
                    "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
                }
            }
        else:
            return {
                "event": "syncFailure",
                "data": {
                    "success": False,
                    "error": result.get("message", "Error durante la sincronización")
                }
            }
    except Exception as e:
        return {
            "event": "syncFailure",
            "data": {
                "success": False,
                "error": f"Error durante la sincronización: {str(e)}"
            }
        }
    
def handle_get_documents(message):
    """
    Maneja la obtención de documentos (uno específico o todos).
    """
    try:
        data = message.get("data", {})
        document_id = data.get("id")  # Será None si no se proporciona
        
        print("intentando procesar documentos")
        
        result = get_documents_use_case.execute(document_id)

        if result.get("success"):
            response = {
                "event": "getDocumentsSuccess",
                "data": result["data"]
            }
        else:
            response = {
                "event": "getDocumentsFailure",
                "data": {
                    "success": False,
                    "error": result.get("error", "Error desconocido")
                }
            }
        
        # Usar la función de envío personalizada
        return send_response(response)

    except Exception as e:
        error_response = {
            "event": "getDocumentsFailure",
            "data": {
                "success": False,
                "error": f"Error al obtener documentos: {str(e)}"
            }
        }
        return send_response(error_response)