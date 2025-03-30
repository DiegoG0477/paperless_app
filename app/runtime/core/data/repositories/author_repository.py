from sqlalchemy.orm import joinedload
from config.database import get_db_session
from core.data.models.orm_models import Author, PersonalData
from core.domain.models.author import AuthorDomain

class AuthorRepository:
    def get_author_by_name(self, first_name: str, last_name: str):
        """
        Busca un autor en la BD por nombre y apellido.
        Retorna el autor en formato de dominio si existe, de lo contrario, None.
        """
        session = get_db_session()
        try:
            author = (
                session.query(Author)
                .join(PersonalData)
                .filter(PersonalData.first_name == first_name, PersonalData.last_name == last_name)
                .options(joinedload(Author.personal_data))
                .first()
            )
            return AuthorDomain(author.id, author.personal_data.first_name, author.personal_data.last_name, author.user_id) if author else None
        finally:
            session.close()

    def get_or_create_author(self, full_name: str):
        """
        Busca un autor por su nombre completo (dividiendo en nombre y apellido si es necesario).
        Si no existe, lo crea y lo devuelve en formato de dominio.
        """
        session = get_db_session()
        first_name, last_name = self._split_name(full_name)

        existing_author = self.get_author_by_name(first_name, last_name)
        if existing_author:
            return existing_author

        try:
            # Crear el registro en PersonalData
            personal_data = PersonalData(first_name=first_name, last_name=last_name)
            session.add(personal_data)
            session.flush()  # Obtiene el ID autogenerado

            # Crear el registro en Author
            author = Author(personal_data_id=personal_data.id)
            session.add(author)
            session.commit()
            session.refresh(author)

            return AuthorDomain(author.id, first_name, last_name)
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()

    def _split_name(self, full_name: str):
        """
        Separa un nombre completo en `first_name` y `last_name`.
        - Si hay un solo nombre, se usa como `first_name` y `last_name` queda vacío.
        - Si hay múltiples nombres y apellidos, se asume el último como apellido y el resto como nombres.
        """
        parts = full_name.strip().split()
        if len(parts) == 1:
            return parts[0], ""
        elif len(parts) == 2:
            return parts[0], parts[1]
        else:
            return " ".join(parts[:-1]), parts[-1]  # Todo menos el último es `first_name`, el último es `last_name`