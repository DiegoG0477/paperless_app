# /app/runtime/core/data/services/spellcheck_service.py
import re
import spacy
import enchant

def detect_spelling_errors(text):
    """
    Detecta errores ortográficos en el texto combinando spaCy y PyEnchant.
    
    Retorna una lista de errores con:
      - "word": La palabra mal escrita.
      - "suggestions": Sugerencias de corrección.
    """
    nlp = spacy.load("es_core_news_sm")

    dictionary = enchant.Dict("es_ES")  # Corrector en español
    errors = []

    # Procesar el texto con spaCy
    doc = nlp(text)
    
    for token in doc:
        # Omitir nombres propios y palabras con caracteres especiales
        if token.is_stop or token.is_punct or token.like_num or token.is_space:
            continue

        word = token.text.lower()
        
        if not dictionary.check(word):  # Si la palabra está mal escrita
            
            errors.append({
                "word": word,
                #"suggestions": suggestions if suggestions else ["Sin sugerencias"]
            })

    return errors

# Caso de uso:
# errores = detect_spelling_errors("Texto con algus errores ortográficos en una sentncia")
# print(errores)

def get_suggestions(word):
    """
    Obtiene sugerencias de corrección para una palabra.
    """
    result = []
    dictionary = enchant.Dict("es_ES")  # Corrector en español
    suggestions =  dictionary.suggest(word)

    if suggestions:
        result = suggestions

    return result