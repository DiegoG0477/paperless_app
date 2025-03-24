import spacy
import re
from datetime import datetime
from spacy.matcher import Matcher
from spacy.tokens import Span

# Cargar modelo y componentes
nlp = spacy.load("es_core_news_sm")
matcher = Matcher(nlp.vocab)

# Configuración de patrones
PATTERNS = {
    'legal_reference': [
        [{"TEXT": {"REGEX": r"^(Art|Ley|Acuerdo|Artículo|Código)"}}, 
         {"TEXT": {"REGEX": r"^\d+"}}],
    ],
    'document_code': [
        [{"TEXT": {"REGEX": r"^[A-Z]{3}-\d{4}-\d{3}$"}}]
    ]
}

# Roles comunes en documentos legales (expandible)
PERSON_ROLES = {
    'demandante': r'\b(demandante|actor|querellante)\b',
    'abogado': r'\b(abogado|letrado|defensor)\b',
    'testigo': r'\b(testigo|declarante)\b'
}

# Tipos de organizaciones
ORG_TYPES = {
    'empresa': r'\b(s\.?a\.?|s\.?r\.?l\.?|corporación|empresa)\b',
    'gobierno': r'\b(municipalidad|gobierno|secretaría|ministerio)\b',
    'sociedad': r'\b(sociedad|asociación|cooperativa|SA de CV|S.A.|S. de R.L.|cooperativa)\b',
    'otro': r'\b(organización|institución|entidad|fundación)\b'\
}

def configure_nlp():
    # Agregar patrones al matcher
    for label, patterns in PATTERNS.items():
        matcher.add(label, patterns)
    
    # Agregar pipeline personalizado
    if not nlp.has_pipe("entity_refiner"):
        nlp.add_pipe("entity_refiner", after="ner")

@spacy.Language.component("entity_refiner")
def entity_refiner(doc):
    new_ents = []
    seen = set()  # Para evitar duplicados
    
    # Procesar entidades existentes
    for ent in doc.ents:
        ent_text = ent.text.lower()
        ent_id = f"{ent.label_}:{ent_text}"
        
        if ent_id not in seen:
            seen.add(ent_id)
            new_ent = process_entity(ent, doc)
            if new_ent:
                new_ents.append(new_ent)
    
    # Procesar matches del matcher
    matches = matcher(doc)
    for match_id, start, end in matches:
        span = doc[start:end]
        label = nlp.vocab.strings[match_id]
        ent_id = f"{label}:{span.text.lower()}"
        
        if ent_id not in seen:
            seen.add(ent_id)
            new_ent = Span(doc, start, end, label=label)
            new_ents.append(new_ent)
    
    doc.ents = new_ents
    return doc

def process_entity(ent, doc):
    # Detección de roles para personas
    if ent.label_ in ["PER", "PERSON"]:
        return process_person(ent, doc)
    
    # Clasificación de organizaciones
    if ent.label_ == "ORG":
        return process_organization(ent)
    
    # Mejora de fechas
    if ent.label_ == "DATE":
        return process_date(ent.text)
    
    return ent

def process_person(ent, doc):
    role = detect_role(ent, doc)
    return {
        "text": ent.text,
        "role": role,
        "type": "física"
    }

def detect_role(ent, doc):
    # Buscar en ventana de 5 tokens alrededor de la entidad
    start = max(0, ent.start - 3)
    end = min(len(doc), ent.end + 3)
    context = doc[start:end].text.lower()
    
    for role, pattern in PERSON_ROLES.items():
        if re.search(pattern, context):
            return role
    return "desconocido"

def process_organization(ent):
    org_text = ent.text.lower()
    org_type = "otro"
    
    for o_type, pattern in ORG_TYPES.items():
        if re.search(pattern, org_text):
            org_type = o_type
            break
            
    return {
        "text": ent.text,
        "type": org_type
    }

def process_date(date_str):
    try:
        parsed_date = datetime.strptime(date_str, "%d/%m/%Y")
        return {
            "date": parsed_date.strftime("%Y-%m-%d"),
            "type": "fecha_exacta"
        }
    except ValueError:
        return {
            "date": date_str,
            "type": "referencia_temporal"
        }


def detect_location_type(ent, doc):
    """
    Determina el tipo de ubicación de una entidad combinando expresiones regulares y análisis
    contextual con spaCy. Se buscan patrones en el propio texto de la entidad y, si no se logra
    determinar el tipo, se analiza el contexto (tokens alrededor de la entidad).
    
    Tipos posibles:
      - "direccion": Si contiene números o palabras como "juzgado", "calle", "avenida".
      - "colonia": Si contiene "colonia" o "fracc".
      - "zona": Si contiene "zona" o términos relacionados con áreas (por ejemplo, "urbana", "norte").
      - "estado": Si el contexto menciona nombres de estados o la palabra "estado".
      - "ciudad": Si la entidad es corta y se asume un nombre de ciudad.
      - "otro": Si no se puede determinar con certeza.
    """
    text = ent.text.lower()
    
    # Primer intento: patrones regex directamente sobre el texto de la entidad
    if re.search(r'\d', text):
        # Si hay dígitos, puede ser una dirección
        if re.search(r'\bjuzgado\b', text):
            return "direccion"
        if re.search(r'\b(calle|avenida)\b', text):
            return "direccion"
        if re.search(r'\b(colonia|fracc)\b', text):
            return "colonia"
        if re.search(r'\b(zona|urbana|norte|sur|este|oeste)\b', text):
            return "zona"
        return "direccion"  # Valor por defecto si contiene números
    else:
        # Sin dígitos, buscar palabras clave específicas en el texto
        if re.search(r'\b(estado)\b', text):
            return "estado"
        if re.search(r'\b(ciudad)\b', text):
            return "ciudad"
    
    # Segundo intento: usar contexto con spaCy si no se obtuvo resultado
    start = max(0, ent.start - 3)
    end = min(len(doc), ent.end + 3)
    context = doc[start:end].text.lower()
    
    # Si el contexto tiene menciones a "juzgado", "calle" o "avenida", se asume dirección.
    if re.search(r'\b(juzgado|calle|avenida)\b', context):
        return "direccion"
    # Si se detecta "colonia" o "fracc" en el contexto
    if re.search(r'\b(colonia|fracc)\b', context):
        return "colonia"
    # Si se detecta "zona" o palabras relacionadas
    if re.search(r'\b(zona|urbana|norte|sur|este|oeste)\b', context):
        return "zona"
    # Si se detecta "estado" en el contexto, se asume estado
    if re.search(r'\b(estado)\b', context):
        return "estado"
    # Si el contexto es muy corto, se asume ciudad
    if len(context.split()) <= 2:
        return "ciudad"

    return "otro"


def extract_entities(text):
    doc = nlp(text)
    entities = {
        "personas": [],
        "fechas": [],
        "referencias_legales": [],
        "organizaciones": [],
        "ubicaciones": [],
        "terminos_clave": []
    }
    
    for ent in doc.ents:
        if ent.label_ in ["PER", "PERSON"]:
            entities["personas"].append(ent._.processed)
        elif ent.label_ == "DATE":
            entities["fechas"].append(ent._.processed)
        elif ent.label_ == "ORG":
            entities["organizaciones"].append(ent._.processed)
        elif ent.label_ in ["LOC", "GPE"]:
            entities["ubicaciones"].append({
                "nombre": ent.text,
                "tipo": detect_location_type(ent, doc)
            })
        elif ent.label_ == "LEGAL_REF":
            entities["referencias_legales"].append({
                "texto": ent.text,
                "tipo": "referencia_legal"
            })
    
    return entities