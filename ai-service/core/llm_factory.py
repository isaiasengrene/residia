"""
Fábrica de proveedores LLM.
Cada agente tiene su proveedor y modelo configurable de forma independiente
mediante variables de entorno.

Variables de entorno por agente:
  AGENTE_{NOMBRE}_PROVEEDOR = anthropic | openai | google
  AGENTE_{NOMBRE}_MODELO    = nombre del modelo

Agentes disponibles: REGISTRO, COMUNICACION, SEGUIMIENTO, PAI

Ejemplo:
  AGENTE_REGISTRO_PROVEEDOR=anthropic
  AGENTE_REGISTRO_MODELO=claude-sonnet-4-6
  AGENTE_COMUNICACION_PROVEEDOR=openai
  AGENTE_COMUNICACION_MODELO=gpt-4o
  AGENTE_SEGUIMIENTO_PROVEEDOR=google
  AGENTE_SEGUIMIENTO_MODELO=gemini-1.5-pro
  AGENTE_PAI_PROVEEDOR=anthropic
  AGENTE_PAI_MODELO=claude-opus-4-8
"""
import os
from core.llm_provider import ProveedorLLM
from core.providers.anthropic_provider import ProveedorAnthropic
from core.providers.openai_provider import ProveedorOpenAI
from core.providers.google_provider import ProveedorGoogle

# Proveedores y modelos por defecto si no se configura nada
_DEFAULTS: dict[str, tuple[str, str]] = {
    "REGISTRO":      ("anthropic", "claude-sonnet-4-6"),
    "COMUNICACION":  ("anthropic", "claude-sonnet-4-6"),
    "SEGUIMIENTO":   ("anthropic", "claude-sonnet-4-6"),
    "PAI":           ("anthropic", "claude-sonnet-4-6"),
}

_PROVEEDORES_DISPONIBLES = {
    "anthropic": ProveedorAnthropic,
    "openai":    ProveedorOpenAI,
    "google":    ProveedorGoogle,
}


def obtener_proveedor(agente: str) -> ProveedorLLM:
    """
    Devuelve el proveedor LLM configurado para el agente indicado.
    Lee AGENTE_{AGENTE}_PROVEEDOR y AGENTE_{AGENTE}_MODELO del entorno.

    Uso:
        proveedor = obtener_proveedor("REGISTRO")
        respuesta = await proveedor.completar(system, usuario)
    """
    agente = agente.upper()
    default_proveedor, default_modelo = _DEFAULTS.get(agente, ("anthropic", "claude-sonnet-4-6"))

    nombre_proveedor = os.getenv(f"AGENTE_{agente}_PROVEEDOR", default_proveedor).lower()
    nombre_modelo    = os.getenv(f"AGENTE_{agente}_MODELO",    default_modelo)

    clase = _PROVEEDORES_DISPONIBLES.get(nombre_proveedor)
    if clase is None:
        raise ValueError(
            f"Proveedor '{nombre_proveedor}' no reconocido para el agente '{agente}'. "
            f"Opciones disponibles: {list(_PROVEEDORES_DISPONIBLES.keys())}"
        )

    return clase(modelo=nombre_modelo)


def estado_proveedores() -> dict:
    """Devuelve la configuración activa de cada agente. Útil para el endpoint /health."""
    estado = {}
    for agente in _DEFAULTS:
        default_p, default_m = _DEFAULTS[agente]
        proveedor = os.getenv(f"AGENTE_{agente}_PROVEEDOR", default_p)
        modelo    = os.getenv(f"AGENTE_{agente}_MODELO",    default_m)
        estado[agente.lower()] = {"proveedor": proveedor, "modelo": modelo}
    return estado
