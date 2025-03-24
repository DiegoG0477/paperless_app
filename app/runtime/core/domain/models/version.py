# /app/runtime/core/domain/models/version.py
class VersionDomain:
    def __init__(self, id, document_id, version_tag, file_path, file_hash, author_id, comment, updated_at, size_mb):
        self.id = id
        self.document_id = document_id
        self.version_tag = version_tag
        self.file_path = file_path
        self.file_hash = file_hash
        self.author_id = author_id
        self.comment = comment
        self.updated_at = updated_at
        self.size_mb = size_mb

    def to_dict(self):
        return {
            "id": self.id,
            "document_id": self.document_id,
            "version_tag": self.version_tag,
            "file_path": self.file_path,
            "file_hash": self.file_hash,
            "author_id": self.author_id,
            "comment": self.comment,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "size_mb": self.size_mb
        }