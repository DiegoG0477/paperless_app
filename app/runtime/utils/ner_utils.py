import re
from datetime import datetime
from spacy.matcher import Matcher
from spacy.tokens import Span
from spacy.language import Language
from spacy.util import filter_spans
import logging

logging.basicConfig(
    level=logging.ERROR,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

@Language.factory("entity_refiner", default_config={"matcher": None})
class EntityRefiner:
    def __init__(self, nlp, name, matcher):
        self.nlp = nlp
        self.name = name
        self.matcher = matcher

    def __call__(self, doc):
        new_ents = []
        if self.matcher:
            matches = self.matcher(doc)
            for match_id, start, end in matches:
                label = doc.vocab.strings[match_id].upper()
                new_ent = Span(doc, start, end, label=label)
                new_ents.append(new_ent)
        for ent in doc.ents:
            processed = process_entity(ent, doc)
            new_ent = Span(doc, ent.start, ent.end, label=ent.label_)
            new_ent._.processed = processed
            new_ents.append(new_ent)
        doc.ents = tuple(filter_spans(new_ents))
        return doc

def configure_nlp(nlp):
    if not nlp.has_pipe("entity_refiner"):
        matcher = Matcher(nlp.vocab)
        configure_matcher(matcher)
        nlp.add_pipe("entity_refiner", after="ner")
        nlp.get_pipe("entity_refiner").matcher = matcher

def configure_matcher(matcher):
    for label, patterns in PATTERNS.items():
        matcher.add(label, patterns)

PATTERNS = {
    'legal_reference': [
        [
            {"TEXT": {"REGEX": r"^(Art(?:[íi]culo)?\.?|Ley|Código|Decreto|Norma|Acuerdo)$"}},
            {"TEXT": {"REGEX": r"^\s*[\.:]?\s*\d+[A-Za-z]?$"}}
        ],
        [
            {"TEXT": {"REGEX": r"^(Art(?:[íi]culo)?\.?|Ley|Código|Decreto|Norma)$"}},
            {"TEXT": {"REGEX": r"^\s*\d+(?:[\-/]\d+)?$"}}
        ],
        [
            {"TEXT": {"REGEX": r"^(Ley|Código)$"}},
            {"TEXT": {"REGEX": r"^(?:No\.?\s*)?\d+(?:\s*[A-Za-z]+)?$"}}
        ],
        [
            {"TEXT": {"REGEX": r"^(Art(?:[íi]culo)?\.?)$"}},
            {"TEXT": {"REGEX": r"^\s*\d+(?:\s*(bis|ter))?$"}}
        ]
    ],
    'document_code': [
        [{"TEXT": {"REGEX": r"^[A-Z]{3}-\d{4}-\d{3}$"}}],
        [{"TEXT": {"REGEX": r"^[A-Z]{3}\d{6}$"}}],
        [{"TEXT": {"REGEX": r"^[A-Z]{3}-\d{2}[A-Z]\d-\d{3}$"}}]
    ],
    'person_with_role': [
        [
            {"LOWER": {"IN": [
                "secretario", "juez", "fiscal", "notario", "magistrado", "actuario",
                "testigo", "arrendatario", "deudor", "acreedor", "demandante", "abogado", 
                "perito", "procurador", "mediador", "asesor", "apoderado", "consultor jurídico",
                "defensor", "letrado", "querellante"
            ]}},
            {"POS": "PROPN", "OP": "+"}
        ],
        [
            {"POS": "PROPN", "OP": "+"},
            {"LOWER": {"IN": [
                "secretario", "juez", "fiscal", "notario", "magistrado", "actuario",
                "testigo", "demandante", "abogado", "perito", "procurador", "mediador",
                "asesor", "apoderado", "representante", "defensor", "letrado", "querellante"
            ]}}
        ]
    ]
}

KEYWORDS = {
    "indemnización", "cláusula", "amparo", "sentencia", "recurso", "contrato",
    "incumplimiento", "arrendatario", "garantía", "litigio", "notificación", "propiedad", 
    "herencia", "bienes", "delito", "acusado", "licencia", "apelación", "defensa", 
    "arbitraje", "prueba", "ejecución", "resolución", "demanda", "procedimiento", "dictamen"
}

PERSON_ROLES = {
    'demandante': r'\b(demandante|actor|querellante|quejoso)\b',
    'abogado': r'\b(abogado|letrado|defensor|consultor jurídico)\b', 
    'juez': r'\b(juez|magistrado|jueza|presidente de tribunal)\b',
    'secretario': r'\b(secretario|actuario|oficial judicial)\b',
    'notario': r'\b(notario|corredor público)\b',
    'perito': r'\b(perito|experto forense|ingeniero)\b',
    'testigo': r'\b(testigo)\b',
    'demandado': r'\b(demandado|acusado|procesado|imputado)\b',
    'fiscal': r'\b(fiscal|ministerio público|procurador)\b',
    'autoridad': r'\b(autoridad|funcionario|servidor público)\b',
    'víctima': r'\b(víctima|ofendido|agraviado)\b',
    'asesor': r'\b(asesor|consultor|consejero legal)\b',
    'apoderado': r'\b(apoderado|representante legal|mandatario)\b',
    'mediador': r'\b(mediador|conciliador|árbitro)\b',
    'procurador': r'\b(procurador|gestor judicial)\b',
    'tercero': r'\b(tercero interesado|tercero perjudicado|tercero coadyuvante)\b',
    'perito_traductor': r'\b(perito traductor|traductor oficial|intérprete)\b'
}

ORG_TYPES = {
    'empresa': r'\b(s\.?a\.?|s\.?r\.?l\.?|corporación|empresa|sa de cv|s\.?a\.?p\.?i\.?|s\.?c\.?|sociedad anónima|sociedad limitada|compañía|firma|grupo empresarial|holding|consorcio|comercial|industrial|corp|corporativo|corporación)\b',
    'gobierno': r'\b(gobierno|secretaría|ministerio|instituto|fiscalía|dirección general|subsecretaría|delegación|procuraduría|coordinación|dependencia|organismo público|ayuntamiento|municipalidad|alcaldía|gubernatura|comisión nacional|agencia estatal)\b',
    'educativa': r'\b(universidad|escuela|colegio|facultad|instituto tecnológico|centro educativo|academia|preparatoria|bachillerato|conservatorio|seminario|centro de investigación|campus|politécnico|centro de estudios)\b',
    'judicial': r'\b(juzgado|tribunal|consejo de la judicatura|corte|sala|órgano jurisdiccional|suprema corte|audiencia|fiscalía general|procuraduría general|defensoría pública|ministerio público|magistratura)\b',
    'salud': r'\b(hospital|clínica|centro de salud|sanatorio|instituto médico|centro médico|unidad médica|dispensario|policlínica|laboratorio clínico|centro de diagnóstico|centro de rehabilitación|consultorio médico)\b',
    'fundación': r'\b(fundación|asociación civil|ac|ong|organización no gubernamental|institución de asistencia privada|iap|asociación de beneficencia|organización sin fines de lucro|osfl|asociación benéfica)\b',
    'financiera': r'\b(banco|casa de bolsa|aseguradora|financiera|casa de cambio|sociedad financiera|cooperativa de ahorro|afore|institución de crédito|fondo de inversión|institución bancaria)\b',
    'religiosa': r'\b(iglesia|parroquia|diócesis|arquidiócesis|congregación|orden religiosa|templo|santuario|monasterio|convento|seminario religioso)\b',
    'deportiva': r'\b(club deportivo|federación deportiva|asociación deportiva|liga|equipo|centro deportivo|complejo deportivo|unidad deportiva)\b',
    'cultural': r'\b(museo|teatro|centro cultural|galería|biblioteca|casa de cultura|instituto cultural|centro de artes|auditorio|conservatorio de música|filmoteca|cineteca)\b',
    'comercial': r'\b(cámara de comercio|asociación comercial|centro comercial|plaza comercial|mercado|tienda departamental|cadena comercial|franquicia)\b',
    'sindical': r'\b(sindicato|unión de trabajadores|federación sindical|confederación laboral|gremio|asociación gremial|central obrera)\b',
    'investigación': r'\b(centro de investigación|instituto de investigación|laboratorio de investigación|centro de desarrollo|centro de innovación|parque tecnológico|centro de estudios avanzados)\b',
    'cooperativa': r'\b(cooperativa|sociedad cooperativa|unión de cooperativas|caja popular|sociedad mutualista|colectivo)\b',
    'internacional': r'\b(organismo internacional|organización internacional|agencia internacional|comisión internacional|misión diplomática|embajada|consulado|representación internacional)\b'
}

month_map_es = {
    'enero': 1, 'febrero': 2, 'marzo': 3, 'abril': 4,
    'mayo': 5, 'junio': 6, 'julio': 7, 'agosto': 8,
    'septiembre': 9, 'octubre': 10, 'noviembre': 11, 'diciembre': 12
}

def convert_spanish_number(s: str) -> int:
    mapping = {
        "cero": 0, "uno": 1, "dos": 2, "tres": 3,
        "cuatro": 4, "cinco": 5, "seis": 6, "siete": 7,
        "ocho": 8, "nueve": 9, "diez": 10, "once": 11,
        "doce": 12, "trece": 13, "catorce": 14, "quince": 15,
        "dieciséis": 16, "diecisiete": 17, "dieciocho": 18, "diecinueve": 19,
        "veinte": 20, "veintiuno": 21, "veintidós": 22, "veintitrés": 23,
        "veinticuatro": 24, "veinticinco": 25, "veintiséis": 26, "veintisiete": 27,
        "veintiocho": 28, "veintinueve": 29, "treinta": 30, "treinta y uno": 31,
        "mil": 1000
    }
    s = s.strip().lower()
    if s.isdigit():
        return int(s)
    if s in mapping:
        return mapping[s]
    if " y " in s:
        if s in mapping:
            return mapping[s]
    tokens = s.split()
    if "mil" in tokens:
        idx = tokens.index("mil")
        thousands = 1000 if idx == 0 else mapping.get(tokens[0], 0) * 1000
        remainder = 0
        if len(tokens) > idx + 1:
            rem_phrase = " ".join(tokens[idx+1:])
            if rem_phrase in mapping:
                remainder = mapping[rem_phrase]
            else:
                for token in tokens[idx+1:]:
                    remainder += mapping.get(token, 0)
        return thousands + remainder
    return None

def process_date(date_str):
    try:
        date_str = date_str.strip()

        INVALID_DATE = "__INVALID_DATE__"
        
        # Intento 1: Parseo directo con formato español
        date_pattern = re.compile(
            r"(?P<day>\d{1,2})\s+de\s+(?P<month>[a-záéíóúñ]+)\s+de\s+(?P<year>\d{4})", 
            re.IGNORECASE
        )
        
        match = date_pattern.match(date_str.lower())
        if match:
            try:
                day = int(match.group('day'))
                month = month_map_es[match.group('month').lower().strip()]
                year = int(match.group('year'))
                return {
                    "fecha": f"{year}-{month:02d}-{day:02d}",
                    "evento": "",
                    "is_valid": True
                }
            except (KeyError, ValueError) as e:
                logging.warning(f"Fecha parcialmente inválida: {date_str} - {str(e)}")
        
        # Intento 2: Usar datetime con locale
        try:
            import locale
            locale.setlocale(locale.LC_TIME, 'es_ES.UTF-8')
            date_obj = datetime.strptime(date_str, "%d de %B de %Y")
            return {
                "fecha": date_obj.strftime("%Y-%m-%d"),
                "evento": "",
                "is_valid": True
            }
        except (ValueError, locale.Error) as e:
            logging.debug(f"Formato alternativo no reconocido: {date_str} - {str(e)}")
        
        # Intento 3: Coincidencia flexible
        parts = re.split(r'\s+de\s+', date_str.lower())
        if len(parts) == 3 and parts[1] in month_map_es:
            try:
                day = int(parts[0])
                month = month_map_es[parts[1]]
                year = int(parts[2])
                return {
                    "fecha": f"{year}-{month:02d}-{day:02d}",
                    "evento": "",
                    "is_valid": True
                }
            except ValueError as e:
                logging.warning(f"Componentes de fecha inválidos: {date_str} - {str(e)}")
        
        # Si llegamos aquí, la fecha no es válida
        return INVALID_DATE
        
    except Exception as e:
        logging.error(f"Error crítico procesando fecha: {date_str} - {str(e)}")
        return INVALID_DATE

def detect_location_type(ent, doc):
    """
    Detecta el tipo de ubicación basado en el texto y contexto.
    
    Args:
        ent (Union[Span, dict]): La entidad a procesar (puede ser un Span de spaCy o un diccionario)
        doc (Doc): El documento spaCy completo
    
    Returns:
        str: El tipo de ubicación detectada
    """
    # Si ent es un diccionario, extraer los valores necesarios
    if isinstance(ent, dict):
        text = ent.get('text', '').lower()
        start = ent.get('start', 0)
        end = ent.get('end', 0)
    else:
        text = ent.text.lower()
        start = ent.start
        end = ent.end
    
    # Nueva lógica para nombres compuestos
    if ' ' in text:
        context = doc[max(0, start-2):min(len(doc), end+2)].text.lower()
        if re.search(r'\b(ciudad|municipio|estado)\s+de\s+', context):
            return "ciudad" if 'ciudad' in context else "estado"
    
    # Mejorar detección de ciudades compuestas
    if re.search(r'\b(ciudad de \w+)|(puerto \w+)\b', text):
        return "ciudad"
    
    if re.search(r'\d', text):
        if re.search(r'\bjuzgado\b', text) or re.search(r'\b(calle|avenida|autopista|carretera)\b', text):
            return "direccion"
        if re.search(r'\b(colonia|fracc|barrio|urbanización)\b', text):
            return "colonia"
        if re.search(r'\b(zona|urbana|norte|sur|este|oeste)\b', text):
            return "zona"
        return "direccion"
    else:
        if re.search(r'\b(estado|provincia)\b', text):
            return "estado"
        if re.search(r'\b(ciudad|pueblo|municipio)\b', text):
            return "ciudad"
        if re.search(r'\b(país|república|nación)\b', text):
            return "pais"
    
    # Obtener contexto
    start_context = max(0, start - 3)
    end_context = min(len(doc), end + 3)
    context = doc[start_context:end_context].text.lower()
    
    if re.search(r'\b(juzgado|calle|avenida|autopista|carretera)\b', context):
        return "direccion"
    if re.search(r'\b(colonia|fracc|barrio|urbanización)\b', context):
        return "colonia"
    if re.search(r'\b(zona|urbana|norte|sur|este|oeste)\b', context):
        return "zona"
    if re.search(r'\b(estado|provincia)\b', context):
        return "estado"
    if re.search(r'\b(ciudad|pueblo|municipio)\b', context):
        return "ciudad"
    if re.search(r'\b(país|república|nación)\b', context):
        return "pais"
    
    if len(text.split()) <= 2:
        return "ciudad"
    
    return "otro"

def is_valid_name(text):
    """
    Verifica si el texto contiene solo letras, espacios y caracteres válidos para nombres.
    """
    # Permitir letras (incluyendo acentos), espacios y algunos caracteres especiales
    return bool(re.match(r'^[A-ZÁÉÍÓÚÜÑa-záéíóúüñ\s]+$', text))

def process_person(ent, doc):
    try:
        name_tokens = []
        current_part = []
        
        for token in ent:
            if token.pos_ in ['PROPN', 'NOUN'] and token.text.istitle():
                current_part.append(token.text)
            elif current_part:
                name_tokens.append(' '.join(current_part))
                current_part = []
        
        if current_part:
            name_tokens.append(' '.join(current_part))
        
        full_name = ' '.join(name_tokens) if name_tokens else ent.text
        
        # Verificar si el nombre es válido
        if not is_valid_name(full_name):
            return None
        
        # Mejorar detección de roles con contexto ampliado
        context = doc[max(0, ent.start-5):min(len(doc), ent.end+5)].text
        role = detect_role(context)
        
        return {
            "name": full_name.strip(),
            "role": role if role != "desconocido" else "NO",
            "tipo": "física",
            "complete_role": f"{role} {full_name}".strip() if role != "desconocido" else full_name
        }
    except Exception as e:
        logging.warning(f"Error procesando persona: {str(e)}")
        return None  # Cambiar para retornar None en lugar de un objeto parcial

def detect_role(text):
    text = re.sub(r'\s+', ' ', text).lower()  # Normalizar espacios
    
    # Nueva lógica para roles legales
    if 'mediante la presente' in text:
        return "otorgante"
    
    if 'confiero poder a' in text:
        return "apoderado"

    for role, pattern in PERSON_ROLES.items():
        if re.search(pattern, text):
            return role
        
    # Detección por estructura gramatical
    if re.search(r'\b(el|la)\s+\w+\b', text):
        match = re.search(r'\b(el|la)\s+(\w+)', text)
        return match.group(2)
    
    return "desconocido"

def check_if_legal_ref(text):
    """
    Verifica si el texto contiene patrones de referencia legal.
    Ahora busca coincidencias en cualquier parte del texto, no solo al inicio.
    """
    text = text.strip()
    for pattern in PATTERNS['legal_reference']:
        try:
            # Construir el patrón pero haciéndolo más flexible
            pattern_parts = [item['TEXT']['REGEX'] for item in pattern]
            # Eliminar los marcadores de inicio (^) y fin ($) si existen
            pattern_parts = [p.strip('^$') for p in pattern_parts]
            # Crear un patrón que busque estas partes en cualquier lugar del texto
            pattern_text = r'.*?' + r'\s+'.join(pattern_parts) + r'.*?'
            if re.search(pattern_text, text, re.IGNORECASE | re.DOTALL):
                return True
        except Exception as e:
            print(f"Error procesando patrón de referencia legal: {e}")
    return False

def check_if_legal_doc(text):
    """
    Verifica si el texto contiene patrones de documento legal.
    Busca coincidencias en cualquier parte del texto.
    """
    text = text.strip()
    for pattern in PATTERNS['document_code']:
        try:
            # Obtener el patrón base
            pattern_text = pattern[0]['TEXT']['REGEX']
            # Eliminar los marcadores de inicio y fin si existen
            pattern_text = pattern_text.strip('^$')
            # Crear un patrón más flexible que busque en cualquier parte del texto
            flexible_pattern = r'.*?' + pattern_text + r'.*?'
            if re.search(flexible_pattern, text, re.IGNORECASE | re.DOTALL):
                return True
        except Exception as e:
            print(f"Error procesando patrón de documento legal: {e}")
    return False


def check_if_keyword(text):
    """
    Verifica si el texto contiene alguna palabra clave legal.
    Retorna la keyword encontrada o None si no hay coincidencia.
    """
    text_lower = text.lower()
    for keyword in KEYWORDS:
        pattern = r'\b' + re.escape(keyword) + r'\b'
        if re.search(pattern, text_lower):
            return keyword
    return None

# Función auxiliar para debugging
def find_matching_keywords(text):
    """
    Función de utilidad que devuelve todas las keywords encontradas en el texto.
    Útil para debugging y verificación.
    """
    text_lower = text.lower()
    matches = []
    for keyword in KEYWORDS:
        pattern = r'\b' + re.escape(keyword) + r'\b'
        if re.search(pattern, text_lower):
            matches.append(keyword)
    return matches

def process_entity(ent, doc):
    if ent.label_ in ["PERSON_W_ROLE", "PER", "PERSON", "NAME"]:
        return process_person(ent, doc)
    elif ent.label_ == "ORG":
        return process_organization(ent.text)
    elif ent.label_ in ["DATE", "DATE_NATURAL"]:
        result = process_date(ent.text)
        if result == "__INVALID_DATE__":
            # Intentar reclasificar la entidad
            if check_if_legal_ref(ent.text):
                return {"ley": "", "artículo": ent.text}
            elif check_if_legal_doc(ent.text):
                return {"text": ent.text, "label": "LEGAL_DOC"}
            elif keyword := check_if_keyword(ent.text):  # Usar assignment expression
                return {"text": keyword}  # Retornar solo la keyword encontrada
            else:
                return None
        return result
    elif ent.label_ == "LEGAL_DOC":
        return {"text": ent.text, "label": "LEGAL_DOC"}
    elif ent.label_ == "LEGAL_REF":
        return {"ley": "", "artículo": ent.text}
    elif ent.label_ == "KEYWORD":
        if keyword := check_if_keyword(ent.text):  # Usar assignment expression
            return {"text": keyword}  # Retornar solo la keyword encontrada
        return None
    elif ent.label_ == "OTH":
        if check_if_legal_ref(ent.text):
            return {"ley": "", "artículo": ent.text}
        elif check_if_legal_doc(ent.text):
            return {"text": ent.text, "label": "LEGAL_DOC"}
        elif keyword := check_if_keyword(ent.text):  # Usar assignment expression
            return {"text": keyword}  # Retornar solo la keyword encontrada
    return None

def process_organization(text):
    text_lower = text.lower()
    for o_type, pattern in ORG_TYPES.items():
        if re.search(pattern, text_lower):
            return {"name": text, "type": o_type}
    return {"name": text, "type": "otro"}