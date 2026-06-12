"""Proveedor Google (Gemini) — SDK google-genai."""
from __future__ import annotations
import os
from google import genai
from google.genai import types
from core.llm_provider import ProveedorLLM

_cliente: genai.Client | None = None


def _obtener_cliente() -> genai.Client:
    global _cliente
    if _cliente is None:
        _cliente = genai.Client(api_key=os.environ["GOOGLE_API_KEY"])
    return _cliente


class ProveedorGoogle(ProveedorLLM):
    def __init__(self, modelo: str = "gemini-2.0-flash"):
        self.modelo = modelo

    @property
    def nombre_proveedor(self) -> str:
        return f"google/{self.modelo}"

    async def completar(
        self,
        system_prompt: str,
        mensaje_usuario: str,
        max_tokens: int = 1024,
        temperatura: float = 0.3,
    ) -> str:
        cliente = _obtener_cliente()
        config = types.GenerateContentConfig(
            system_instruction=system_prompt,
            max_output_tokens=max_tokens,
            temperature=temperatura,
        )
        respuesta = await cliente.aio.models.generate_content(
            model=self.modelo,
            contents=mensaje_usuario,
            config=config,
        )
        return respuesta.text or ""
