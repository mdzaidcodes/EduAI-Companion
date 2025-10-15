"""
Configuration settings for the EduAI Companion backend.
Handles environment variables and application settings.
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Database settings
    database_url: str = "postgresql://postgres@localhost/eduai_companion"
    
    # Ollama settings
    ollama_url: str = "http://localhost:11434"
    ollama_model: str = "llama3:8b"
    
    # Application settings
    app_name: str = "EduAI Companion"
    debug: bool = True
    
    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()



