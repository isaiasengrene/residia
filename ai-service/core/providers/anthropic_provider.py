"""Proveedor Anthropic (Claude)."""
from __future__ import annotations
import anthropic
import os
from core.llm_provider import ProveedorLLM


class ProveedorAnthropic(ProveedorLLM):
    def __init__(self, modelo: str = "claude-sonnet-4-6"):
        self.modelo = modelo
        self._api_key_override: str | None = None

    @property
    def nombre_proveedor(self) -> str:
        return f"anthropic/{self.modelo}"

    async def completar(
        self,
        system_prompt: str,
        mensaje_usuario: str,
        max_tokens: int = 1024,
        temperatura: float = 0.3,
    ) -> str:
        api_key = self._api_key_override or os.environ["ANTHROPIC_API_KEY"]
        cliente = anthropic.Anthropic(api_key=api_key)
        respuesta = cliente.messages.create(
            model=self.modelo,
            max_tokens=max_tokens,
            system=system_prompt,
            messages=[{"role": "user", "content": mensaje_usuario}],
        )
        return respuesta.content[0].text
