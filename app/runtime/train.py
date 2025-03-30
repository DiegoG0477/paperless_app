from pathlib import Path

train = False

if train:
    from config.nlp_train_model import fine_tune_model, nlp
    
    TRAINING_FILE = Path(__file__).resolve().parent / "resources" / "nlp_training_data.json"
    print("resources path: ", TRAINING_FILE)

    
    fine_tune_model(TRAINING_FILE, iterations=20)
else:
    from core.usecases.sync_documents_use_case import sync_documents

    # Inicia el proceso de sincronización de documentos
    path = "/home/diego/Documentos/Paperless/sample"

    sync_documents(path)