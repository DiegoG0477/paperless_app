# /app/runtime/bridge/python_adapter.py
import sys
import json
from bridge.event_handler import handle_event

import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def run_adapter():
    """
    Escucha los mensajes entrantes desde Electron, los procesa y responde.
    """

    logging.info("Levantando manejador de eventos...")

    while True:
        line = sys.stdin.readline()
        if not line:
            break
        try:
            message = json.loads(line)
            response = handle_event(message)  # Delegar la ejecución al manejador de eventos
            sys.stdout.write(json.dumps(response) + "\n")
            sys.stdout.flush()
        except Exception as e:
            # Manejo de errores global para evitar que se rompa el proceso
            error_response = {"event": "error", "data": {"message": str(e)}}
            sys.stdout.write(json.dumps(error_response) + "\n")
            sys.stdout.flush()