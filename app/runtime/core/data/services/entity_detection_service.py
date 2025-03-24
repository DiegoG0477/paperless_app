# entity_detection_service.py
import spacy
import re

# Cargar modelo spaCy en español y agregar patrones personalizados
nlp = spacy.load("es_core_news_sm")

def add_custom_patterns(nlp):
    from spacy.pipeline import EntityRuler
    ruler = nlp.add_pipe("entity_ruler", before="ner")
    patterns = [
        {"label": "DOC_CODE", "pattern": [{"TEXT": {"REGEX": "^[A-Z]{3}-\\d{4}-\\d{3}$"}}]},
        # Agrega otros patrones específicos del dominio legal si es necesario.
    ]
    ruler.add_patterns(patterns)

add_custom_patterns(nlp)

def extract_entities(text):
    """
    Procesa el texto y extrae entidades tanto con spaCy como con expresiones regulares.
    Retorna un diccionario estructurado.
    """
    doc = nlp(text)
    entities = {
        "personas": [],
        "fechas": [],
        "referencias_legales": [],
        "organizaciones": [],
        "ubicaciones": [],
        "terminos_clave": []
    }
    
    # Extraer entidades usando spaCy
    for ent in doc.ents:
        if ent.label_ in ["PER", "PERSON"]:
            entities["personas"].append({"nombre": ent.text})
        elif ent.label_ == "DATE":
            entities["fechas"].append({"tipo": "general", "valor": ent.text})
        elif ent.label_ == "ORG":
            entities["organizaciones"].append({"nombre": ent.text})
        # Puedes agregar más reglas según la necesidad
    
    return entities

# Caso de uso:
# text = "El demandante Juan Pérez firmó el documento ABC-2023-001 el 01/10/2023."
# entidades = extract_entities(text)
# Luego, este JSON se puede actualizar en la tabla analyzed_content.
