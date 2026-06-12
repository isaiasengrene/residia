"""
Abstracción de proveedor LLM. Permite usar Anthropic, OpenAI o Google
en cada agente de forma independiente, sin cambiar la lógica del agente.
"""
from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class ConfiguracionLLM:
    proveedor: str   # "anthropic" | "openai" | "google"
    modelo: str      # e.g. "claude-sonnet-4-6", "gpt-4o", "gemini-1.5-pro"
    max_tokens: int = 1024
    temperatura: float = 0.3


class ProveedorLLM(ABC):
    """Interfaz común para todos los proveedores de LLM."""

    @abstractmethod
    async def completar(
        self,
        system_prompt: str,
        mensaje_usuario: str,
        max_tokens: int = 1024,
        temperatura: float = 0.3,
    ) -> str:
        """Envía una solicitud al LLM y devuelve el texto de respuesta."""
        ...

    @property
    @abstractmethod
    def nombre_proveedor(self) -> str:
        """Nombre del proveedor para logging."""
        ...
