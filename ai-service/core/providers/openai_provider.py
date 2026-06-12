"""Proveedor OpenAI (GPT)."""
from __future__ import annotations
import os
from openai import AsyncOpenAI
from core.llm_provider import ProveedorLLM


class ProveedorOpenAI(ProveedorLLM):
    def __init__(self, modelo: str = "gpt-4o"):
        self.modelo = modelo
        self._api_key_override: str | None = None

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
        api_key = self._api_key_override or os.environ["OPENAI_API_KEY"]
        cliente = AsyncOpenAI(api_key=api_key)
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
