class TransformersWrapper:
    _instance = None
    _initialized = False
    
    @classmethod
    def get_instance(cls):
        if not cls._instance:
            cls._instance = cls()
        return cls._instance
    
    def __init__(self):
        self.AutoTokenizer = None
        self.AutoModelForTokenClassification = None
        self.pipeline = None
    
    def initialize(self):
        if not self._initialized:
            from transformers import (
                AutoTokenizer,
                AutoModelForTokenClassification,
                pipeline
            )
            self.AutoTokenizer = AutoTokenizer
            self.AutoModelForTokenClassification = AutoModelForTokenClassification
            self.pipeline = pipeline
            self._initialized = True