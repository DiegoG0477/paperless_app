# /app/runtime/core/domain/models/spelling_error.py
# from dataclasses import dataclass

# @dataclass
# class SpellingError:
#     id: int
#     word: str
#     version_id: int

class SpellingErrorDomain:
    def __init__(self, error_id, word, version_id):
        self.id = error_id
        self.word = word
        self.version_id = version_id

    def __repr__(self):
        return f"SpellingErrorDomain({self.id}, {self.word})"

    # Aquí podrías incluir métodos de lógica de negocio propios del dominio,
    # por ejemplo, validaciones o reglas de negocio específicas.