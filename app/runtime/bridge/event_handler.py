# /app/runtime/bridge/event_handler.py
import time
from di.dependencies import login_use_case, set_main_path_use_case

def handle_event(message):
    """
    Procesa los eventos recibidos desde el frontend.
    """
    command = message.get("command")
    
    if command == "ping":
        return {"event": "pong", "data": {"message": "Backend activo", "timestamp": time.time()}}

    elif command == "syncDocuments":
        return {"event": "syncCompleted", "data": {"success": True, "count": 3, "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")}}

    elif command == "login":
        return handle_login(message)
    
    elif command == "setMainPath":
        return handle_set_main_path(message)

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