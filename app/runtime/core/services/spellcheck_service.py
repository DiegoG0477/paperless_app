# spellcheck_service.py
import enchant

def detect_spelling_errors(text):
    """
    Detecta errores ortográficos usando la biblioteca pyenchant.
    Retorna una lista de errores con la palabra y sugerencias.
    """
    dictionary = enchant.Dict("es_ES")  # Usando el diccionario en español
    errors = []
    # Tokenizar el texto (muy simplificado, se puede usar nltk o spaCy)
    words = text.split()
    for word in words:
        if not dictionary.check(word):
            suggestions = dictionary.suggest(word)
            errors.append({
                "word": word,
                "suggestions": suggestions
            })
    return errors

# Caso de uso:
# errores = detect_spelling_errors("Texto con algus errores ortográficos")
# Estos errores se pueden agregar al JSON del analyzed_content o guardarse en una tabla.
