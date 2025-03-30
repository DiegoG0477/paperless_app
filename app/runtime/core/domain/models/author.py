class AuthorDomain:
    def __init__(self, id, first_name, last_name, user_id=None):
        self.id = id
        self.first_name = first_name
        self.last_name = last_name
        self.user_id = user_id

    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    def to_dict(self):
        return {
            "id": self.id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "user_id": self.user_id
        }