# /app/runtime/core/domain/models/document.py
class DocumentDomain:
    def __init__(self, id, title, description, doc_type, unique_hash, created_at, main_path):
        self.id = id
        self.title = title
        self.description = description
        self.doc_type = doc_type
        self.unique_hash = unique_hash
        self.created_at = created_at
        self.main_path = main_path

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "doc_type": self.doc_type,
            "unique_hash": self.unique_hash,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "main_path": self.main_path
        }