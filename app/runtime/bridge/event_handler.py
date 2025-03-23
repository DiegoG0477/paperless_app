# /app/runtime/bridge/event_handler.py
import time
from di.dependencies import login_use_case

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