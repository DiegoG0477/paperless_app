# /app/runtime/core/domain/settings.py
class SettingsDomain:
    def __init__(self, main_path: str):
        self.main_path = main_path

    def __repr__(self):
        return f"SettingsDomain(main_path='{self.main_path}')"