# REPO = "agomez302/nlp-dr-ner"

######## # Configurar el modo offline (solamente si ya descargaste el modelo)
######### os.environ["TRANSFORMERS_OFFLINE"] = "1"
######### os.environ["HF_DATASETS_OFFLINE"] = "1"

########### LOCAL_MODEL_PATH = "./models/nlp-dr-ner"

import re
import spacy
from spacy.tokens import Span
from spacy.util import filter_spans
from transformers import AutoTokenizer, AutoModelForTokenClassification, pipeline
from spacy.language import Language

# Importa la función de postprocesado desde ner_utils (ya definida en otro módulo)
from utils.ner_utils import process_entity, detect_role

# Registra la extensión "processed" en Span
Span.set_extension('processed', default=None, force=True)

# --- Parámetro de configuración ---
# 1: SOLO usar el modelo de fechas legales (legal dates)
# 2: SOLO usar el modelo RoBERTa NER
# 3: Usarlos juntos (combinados)
NER_MODE = 3

class HuggingFaceNERModel:
    """
    Wrapper para el modelo RoBERTa configurado con 'ner'.
    """
    def __init__(self, repo, aggregation_strategy="simple", task="ner"):
        self.tokenizer = AutoTokenizer.from_pretrained(repo)
        self.model = AutoModelForTokenClassification.from_pretrained(repo)
        try:
            self.nlp_pipeline = pipeline(
                task,
                model=self.model,
                tokenizer=self.tokenizer,
                aggregation_strategy=aggregation_strategy
            )
        except TypeError as e:
            print(f"Falling back to pipeline without aggregation_strategy due to: {e}")
            self.nlp_pipeline = pipeline(
                task,
                model=self.model,
                tokenizer=self.tokenizer
            )
            
    def process_text(self, text):
        try:
            predictions = self.nlp_pipeline(text)
            
            # Unir entidades adyacentes
            merged_predictions = merge_adjacent_entities(predictions)
            
            # Deduplicar
            unique = []
            seen = set()
            for entity in merged_predictions:
                key = (entity.get('entity_group'), 
                    entity.get('word'), 
                    entity.get('start'), 
                    entity.get('end'))
                if key not in seen:
                    unique.append(entity)
                    seen.add(key)
            return unique
        except Exception as e:
            print(f"Error en process_text: {e}")
            return []

class NerProcessor:
    """
    Wrapper para el modelo de fechas legales configurado con task="ner".
    Incorpora la funcionalidad para dividir el texto en chunks y deduplicar predicciones.
    """
    def __init__(self, repo, aggregation_strategy="simple", task="ner"):
        self.tokenizer = AutoTokenizer.from_pretrained(repo)
        self.model = AutoModelForTokenClassification.from_pretrained(repo)
        try:
            self.nlp_pipeline = pipeline(
                task,
                model=self.model,
                tokenizer=self.tokenizer,
                aggregation_strategy=aggregation_strategy
            )
        except TypeError as e:
            print(f"Falling back to pipeline without aggregation_strategy due to: {e}")
            self.nlp_pipeline = pipeline(
                task,
                model=self.model,
                tokenizer=self.tokenizer
            )

    # Modificar la función split_text_with_overlap en NerProcessor:
    def split_text_with_overlap(self, text, max_tokens=450, overlap=50):
        if not text:
            return []
        
        # Obtener la longitud máxima del modelo
        model_max_length = self.model.config.max_position_embeddings
        max_tokens = min(max_tokens, model_max_length)
        
        # Tokenizar sin special tokens
        tokens = self.tokenizer.encode(text, 
                                    add_special_tokens=False, 
                                    truncation=False)
        
        chunks = []
        i = 0
        while i < len(tokens):
            # Calcular fin del chunk
            end = i + max_tokens
            chunk_tokens = tokens[i:end]
            
            # Decodificar preservando espacios
            chunk_text = self.tokenizer.decode(chunk_tokens, 
                                            skip_special_tokens=True,
                                            clean_up_tokenization_spaces=False)
            
            chunks.append(chunk_text.strip())
            
            # Retroceder para overlap, pero no menos de 0
            i = max(end - overlap, 0)
            
            # Romper si no hay progreso (texto muy largo sin espacios)
            if i == 0 and end >= len(tokens):
                break

        return chunks

    def deduplicate_entities(self, predictions):
        unique = []
        seen = set()
        for entity in predictions:
            key = (entity.get('entity_group'), entity.get('word'), 
                   entity.get('start'), entity.get('end'))
            if key not in seen:
                unique.append(entity)
                seen.add(key)
        return unique

    def process_text(self, text):
        try:
            chunks = self.split_text_with_overlap(text)
            all_predictions = []
            i = 1
            for chunk in chunks:
                print("doc dividido en chunks, chunk ", i, "/", len(chunks))
                i = i + 1
                preds = self.nlp_pipeline(chunk)
                all_predictions.extend(preds)
            deduped = self.deduplicate_entities(all_predictions)
            return deduped
        except Exception as e:
            print(f"Error in process_text (NerProcessor): {e}")
            return []

class CompositeHuggingFaceNER:
    def __init__(self, mode=NER_MODE):
        self.mode = mode
        if self.mode in (2, 3):
            # Modelo RoBERTa NER
            self.roberta_ner = NerProcessor(
                "PlanTL-GOB-ES/roberta-base-bne-capitel-ner", task="ner"
            )
        if self.mode in (1, 3):
            # Modelo de fechas legales
            self.legal_dates_ner = NerProcessor(
                "agomez302/nlp-dr-ner", task="ner"
            )

    def process_text(self, text):
        results = []
        if self.mode == 1:
            results = self.legal_dates_ner.process_text(text)
        elif self.mode == 2:
            results = self.roberta_ner.process_text(text)
        elif self.mode == 3:
            results = self.roberta_ner.process_text(text) + self.legal_dates_ner.process_text(text)
        return results

def merge_adjacent_entities(entities):
    # Código de depuración
    print("\n--- ANTES DE FUSIONAR ---")
    for entity in sorted(entities, key=lambda x: x['start']):
        print(f"Entidad: {entity.get('word')} [{entity.get('entity_group')}] ({entity.get('start')}-{entity.get('end')})")
    
    merged = []
    buffer = None
    
    for entity in sorted(entities, key=lambda x: x['start']):
        if not buffer:
            buffer = entity
            continue
        
        # Calcular la distancia entre entidades
        distance = entity['start'] - buffer['end']
        
        # Nueva condición para nombres compuestos con verificación de distancia
        is_name_component = (
            buffer['entity_group'] == 'PER' and 
            entity['entity_group'] == 'PER' and
            entity['word'][0].isupper() and
            distance <= 2 and  # ¡AÑADIR ESTA VERIFICACIÓN!
            not any(c in '.,;()' for c in buffer['word'] + entity['word'])
        )
        
        # Condiciones mejoradas para ubicaciones
        is_location_component = (
            buffer['entity_group'] in ['LOC', 'GPE'] and
            entity['entity_group'] in ['LOC', 'GPE'] and
            distance <= 2
        )
        
        print(f"Comparando: {buffer['word']} y {entity['word']}, distancia: {distance}, es_nombre: {is_name_component}")
        
        if is_name_component or is_location_component:
            buffer['end'] = entity['end']
            buffer['word'] = ' '.join([buffer['word'].strip(), entity['word'].strip()])
            buffer['score'] = (buffer['score'] + entity['score']) / 2
            print(f"  --> Fusionados en: {buffer['word']}")
        else:
            merged.append(buffer)
            buffer = entity
    
    if buffer:
        merged.append(buffer)
    
    # Código de depuración
    print("\n--- DESPUÉS DE FUSIONAR ---")
    for entity in merged:
        print(f"Entidad: {entity.get('word')} [{entity.get('entity_group')}] ({entity.get('start')}-{entity.get('end')})")
    
    return merged

def post_process_entities(doc, entities):
    """
    Función que toma las entidades detectadas y fusiona las que son nombres compuestos.
    """
    print("\n--- ENTIDADES ANTES DE POST-PROCESAMIENTO ---")
    for ent in entities:
        print(f"Entidad: {ent.text} [{ent.label_}] ({ent.start_char}-{ent.end_char})")
    
    # Convertir a lista para poder modificar
    entities_list = list(entities)
    
    # Ordenar por posición
    entities_list.sort(key=lambda x: x.start_char)
    
    # Lista para entidades fusionadas
    merged_entities = []
    i = 0
    
    while i < len(entities_list):
        current = entities_list[i]
        
        # Si no es una persona o es la última entidad, añadirla directamente
        if current.label_ not in ['PER', 'PERSON'] or i == len(entities_list) - 1:
            merged_entities.append(current)
            i += 1
            continue
        
        # Verificar si la siguiente entidad es adyacente y del mismo tipo
        next_entity = entities_list[i + 1]
        
        # Calcular la distancia en caracteres
        char_distance = next_entity.start_char - current.end_char
        
        # Calcular la distancia en tokens
        token_distance = next_entity.start - current.end
        
        print(f"Comparando: '{current.text}' y '{next_entity.text}'")
        print(f"  Distancia en caracteres: {char_distance}")
        print(f"  Distancia en tokens: {token_distance}")
        print(f"  Tipos: {current.label_} y {next_entity.label_}")
        
        # Condiciones para fusionar:
        # 1. Ambas son personas
        # 2. Están cerca en el texto (menos de 3 caracteres o 1 token)
        # 3. La segunda entidad comienza con mayúscula
        if (current.label_ in ['PER', 'PERSON'] and 
            next_entity.label_ in ['PER', 'PERSON'] and
            char_distance <= 3 and
            token_distance <= 1 and
            next_entity.text.strip() and  # No está vacío
            next_entity.text.strip()[0].isupper()):
            
            # Crear un nuevo span que abarque ambas entidades
            new_span = doc[current.start:next_entity.end]
            
            # Crear una nueva entidad con el texto combinado
            combined_text = current.text + " " + next_entity.text
            
            print(f"  --> Fusionando en: '{combined_text}'")
            
            # Procesar la entidad combinada
            context = doc[max(0, current.start-5):min(len(doc), next_entity.end+5)].text
            role = detect_role(context)
            
            # Crear un nuevo objeto Span
            new_entity = Span(doc, current.start, next_entity.end, label='PER')
            
            # Asignar información procesada
            new_entity._.processed = {
                "name": combined_text.strip(),
                "role": role if role != "desconocido" else "NO",
                "tipo": "física",
                "complete_role": f"{role} {combined_text.strip()}".strip() if role != "desconocido" else combined_text.strip()
            }
            
            merged_entities.append(new_entity)
            i += 2  # Saltar la siguiente entidad ya que la hemos fusionado
        else:
            merged_entities.append(current)
            i += 1
    
    print("\n--- ENTIDADES DESPUÉS DE POST-PROCESAMIENTO ---")
    for ent in merged_entities:
        print(f"Entidad: {ent.text} [{ent.label_}] ({ent.start_char}-{ent.end_char})")
        print(f"Procesado: {ent._.processed}")
    
    return tuple(merged_entities)

@Language.component("composite_hf_ner")
def composite_hf_ner_component(doc):
    composite_ner = CompositeHuggingFaceNER()
    predictions = composite_ner.process_text(doc.text)
    
    # Imprimir predicciones para depuración
    print("\n--- PREDICCIONES ORIGINALES ---")
    for pred in predictions:
        print(f"Predicción: {pred.get('word')} [{pred.get('entity_group')}] ({pred.get('start')}-{pred.get('end')})")
    
    # Crear entidades directamente desde las predicciones
    ents = []
    for pred in predictions:
        start_char = pred.get("start")
        end_char = pred.get("end")
        label = pred.get("entity_group") or pred.get("entity")
        word = pred.get("word")
        
        # Encontrar tokens que cubren este rango
        start_token = None
        end_token = None
        
        for i, token in enumerate(doc):
            # Si el token está dentro del rango de la entidad
            if token.idx <= start_char < token.idx + len(token.text):
                start_token = i
            if token.idx <= end_char <= token.idx + len(token.text):
                end_token = i
                break
        
        if start_token is not None and end_token is not None:
            # Crear span con los tokens encontrados
            span = Span(doc, start_token, end_token + 1, label=label)
            
            # Procesar la entidad
            if label in ["PER", "PERSON", "PERSONA"]:
                context = doc[max(0, start_token-5):min(len(doc), end_token+6)].text
                role = detect_role(context)
                processed = {
                    "name": word,  # Usar la palabra completa de la predicción
                    "role": role if role != "desconocido" else "NO",
                    "tipo": "física",
                    "complete_role": f"{role} {word}".strip() if role != "NO" else word
                }
            else:
                # Procesar otros tipos de entidades
                processed = process_entity(span, doc)
                # Asegurarse de que el nombre sea el de la predicción para entidades compuestas
                if "name" in processed and label in ["PER", "PERSON", "PERSONA"]:
                    processed["name"] = word
            
            span._.processed = processed
            ents.append(span)
    
    # Filtrar entidades superpuestas
    filtered_ents = filter_spans(ents)
    
    # NUEVO: Post-procesar para fusionar nombres compuestos
    merged_ents = post_process_entities(doc, filtered_ents)
    
    # Asignar entidades al documento
    doc.ents = merged_ents
    
    # Imprimir entidades finales para depuración
    print("\n--- ENTIDADES FINALES ---")
    for ent in doc.ents:
        if ent.label_ in ['PER', 'PERSON']:
            print(f"Entidad: {ent.text}")
            print(f"Procesado: {ent._.processed}")
            print(f"Nombre procesado: {ent._.processed.get('name', 'NO DISPONIBLE')}")
            print("---")
    
    return doc

def load_composite_nlp():
    nlp = spacy.load("es_core_news_lg")
    nlp.add_pipe("composite_hf_ner", last=True)
    return nlp

Language.component("composite_hf_ner", func=composite_hf_ner_component)