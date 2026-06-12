"""Proveedor OpenAI (GPT)."""
from __future__ import annotations
import os
from openai import AsyncOpenAI
from core.llm_provider import ProveedorLLM

_cliente: AsyncOpenAI | None = None


def _obtener_cliente() -> AsyncOpenAI:
    global _cliente
    if _cliente is None:
        _cliente = AsyncOpenAI(api_key=os.environ["OPENAI_API_KEY"])
    return _cliente


class ProveedorOpenAI(ProveedorLLM):
    def __init__(self, modelo: str = "gpt-4o"):
        self.modelo = modelo

    @property
    def nombre_proveedor(self) -> str:
        return f"openai/{self.modelo}"

    async def completar(
        self,
        system_prompt: str,
        mensaje_usuario: str,
        max_tokens: int = 1024,
        temperatura: float = 0.3,
    ) -> str:
        cliente = _obtener_cliente()
        respuesta = await cliente.chat.completions.create(
            model=self.modelo,
            max_tokens=max_tokens,
            temperature=temperatura,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": mensaje_usuario},
            ],
        )
        return respuesta.choices[0].message.content or ""
