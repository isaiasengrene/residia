"""Proveedor Anthropic (Claude)."""
from __future__ import annotations
import anthropic
import os
from core.llm_provider import ProveedorLLM

_cliente: anthropic.Anthropic | None = None


def _obtener_cliente() -> anthropic.Anthropic:
    global _cliente
    if _cliente is None:
        _cliente = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    return _cliente


class ProveedorAnthropic(ProveedorLLM):
    def __init__(self, modelo: str = "claude-sonnet-4-6"):
        self.modelo = modelo

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
        cliente = _obtener_cliente()
        respuesta = cliente.messages.create(
            model=self.modelo,
            max_tokens=max_tokens,
            system=system_prompt,
            messages=[{"role": "user", "content": mensaje_usuario}],
        )
        return respuesta.content[0].text
