import sys
import json

def handle_message(message):
    command = message.get("command")
    if command == "ping":
        return {"event": "pong", "data": "El backend está activo"}
    elif command == "syncDocuments":
        # Aquí invocarías la lógica de sincronización desde services/document_sync.py
        # Por ejemplo: result = sync_documents()
        result = "Documentos sincronizados"
        return {"event": "syncCompleted", "data": result}
    else:
        return {"event": "error", "data": f"Comando desconocido: {command}"}

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
            error_response = {"event": "error", "data": str(e)}
            sys.stdout.write(json.dumps(error_response) + "\n")
            sys.stdout.flush()

if __name__ == '__main__':
    run_adapter()