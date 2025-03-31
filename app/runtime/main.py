from bridge import python_adapter

def main():
    # Ejecuta el adapter para recibir mensajes desde Electron
    python_adapter.run_adapter()

if __name__ == '__main__':
    main()