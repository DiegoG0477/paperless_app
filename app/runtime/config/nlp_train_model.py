import json
import spacy
from spacy.training import Example
from utils.ner_utils import configure_nlp

# Cargar modelo base y configurar pipeline
nlp = spacy.load("es_core_news_sm")
configure_nlp(nlp)  # Configura el matcher y el entity_refiner

def load_training_data(training_file):
    """Carga ejemplos de entrenamiento desde un archivo JSON"""
    with open(training_file, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data.get("training_data", [])

def fine_tune_model(training_file, iterations=20):
    """Entrenamiento del modelo con fine-tuning"""
    training_examples = load_training_data(training_file)
    optimizer = nlp.resume_training()
    
    for itn in range(iterations):
        losses = {}
        for example in training_examples:
            doc = nlp.make_doc(example["text"])
            example_obj = Example.from_dict(doc, {"entities": example["entities"]})
            nlp.update([example_obj], drop=0.2, losses=losses, sgd=optimizer)
        print(f"Iteración {itn+1}, Pérdidas: {losses}")
    
    nlp.to_disk("fine_tuned_model")
    return nlp

if __name__ == "__main__":
    fine_tune_model("training_data.json", iterations=20)