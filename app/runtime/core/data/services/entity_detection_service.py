# from utils.ner_utils import detect_location_type, configure_nlp
############ from config.hugging_face_ner_adapter import huggingface_ner_component

# ###########from config.config import get_base_directory

########## Cargar modelo desde la ubicación correcta
######## BASE_DIR = get_base_directory()
######## MODEL_PATH = BASE_DIR / "fine_tuned_model"

######## try:
########     nlp = spacy.load(MODEL_PATH)
######## except IOError:
########     raise RuntimeError(f"Modelo no encontrado en {MODEL_PATH}. Primero ejecuta el entrenamiento")

# nlp = spacy.load('es_core_news_lg')

# configure_nlp(nlp)

# # Add the registered component using its name "huggingface_ner"
# nlp.add_pipe("roberta_es_ner", last=True)

import spacy
from spacy.tokens import Span
from config.transformer_ner_adapter import load_composite_nlp
from utils.ner_utils import detect_location_type  # Tu función para detectar ubicaciones

# Cargar la pipeline compuesta
nlp = load_composite_nlp()

# Registrar la extensión 'processed' con force=True (si es necesario)
Span.set_extension('processed', default=None, force=True)

def extract_entities(text):
    """
    Procesa el texto con la pipeline combinada y extrae entidades.
    """
    doc = nlp(text)

    print("📀 ents: ", doc.ents)

    ubicaciones = []
    current_loc = None
    for ent in doc.ents:
        if ent.label_ in ["LOC", "GPE"]:
            if current_loc and ent.start == current_loc['end']:
                current_loc['text'] += ' ' + ent.text
                current_loc['end'] = ent.end
            else:
                if current_loc: ubicaciones.append(current_loc)
                current_loc = {
                    'text': ent.text,
                    'start': ent.start,
                    'end': ent.end,
                    'label': ent.label_
                }
    if current_loc: ubicaciones.append(current_loc)

    # Procesar y filtrar entidades
    fechas = [
        ent._.processed for ent in doc.ents 
        if ent.label_ in ["DATE", "DATE_NATURAL"] 
        and ent._.processed is not None 
        and ent._.processed != "__INVALID_DATE__"
    ]

    # Resto de entidades procesadas y filtradas
    return {
        "personas": [
            ent._.processed for ent in doc.ents 
            if ent.label_ in ["PER", "PERSON", "PERSONA"] 
            and isinstance(ent._.processed, dict)
        ],
        "fechas": fechas,
        "organizaciones": [
            ent._.processed for ent in doc.ents 
            if ent.label_ == "ORG" 
            and ent._.processed is not None
        ],
        "ubicaciones": [
            {
                "tipo": detect_location_type({
                    'text': loc['text'],
                    'start': loc['start'],
                    'end': loc['end']
                }, doc),
                "valor": loc['text']
            } for loc in ubicaciones
        ],
        "referencias_legales": [
            ent._.processed for ent in doc.ents 
            if (ent.label_ == "LEGAL_REF" or 
                (ent.label_ in ["DATE", "DATE_NATURAL", "OTH"] and 
                 isinstance(ent._.processed, dict) and 
                 "artículo" in ent._.processed)) and 
            ent._.processed is not None
        ],
        "terminos_clave": [
            ent.text for ent in doc.ents 
            if ent.label_ in ["LEGAL_DOC", "KEYWORD"] or
            (ent.label_ in ["DATE", "DATE_NATURAL", "OTH"] and 
             isinstance(ent._.processed, dict) and 
             "text" in ent._.processed)
        ]
    }