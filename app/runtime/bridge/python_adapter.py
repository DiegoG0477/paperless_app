import sys
import json
import time

def handle_message(message):
    command = message.get("command")
    if command == "ping":
        return {
            "event": "pong", 
            "data": {
                "message": "Backend activo",
                "timestamp": time.time()
            }
        }
    elif command == "syncDocuments":
        return {
            "event": "syncCompleted", 
            "data": {
                "success": True,
                "count": 3,
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
            }
        }
    else:
        return {"event": "error", "data": "Comando desconocido"}

def run_adapter():
    while True:
        line = sys.stdin.readline()
        if not line:
            break
        try:
            message = json.loads(line)
            response = handle_message(message)
            sys.stdout.write(json.dumps(response) + "\n")
            sys.stdout.flush()
        except Exception as e:
            # Enviar errores como JSON
            error_response = {"event": "error", "data": str(e)}
            sys.stdout.write(json.dumps(error_response) + "\n")
            sys.stdout.flush()

if __name__ == '__main__':
    run_adapter()