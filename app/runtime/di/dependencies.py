# /app/runtime/di/dependencies.py
from core.data.repositories.user_repository import UserRepository
from core.data.services.password_hasher import PasswordHasher
from core.usecases.login_use_case import LoginUseCase

user_repository = UserRepository()
password_hasher = PasswordHasher()

login_use_case = LoginUseCase(user_repository, password_hasher)


from core.data.repositories.settings_repository import SettingsRepository
from core.usecases.set_main_path_use_case import SetMainPathUseCase

settings_repository = SettingsRepository()

set_main_path_use_case = SetMainPathUseCase(settings_repository)

