"""
Fábrica de proveedores LLM con soporte para configuración dinámica desde la base de datos.
Prioridad: 1) Configuración en BD (via API backend) → 2) Variables de entorno (fallback)
"""
import os
import time
import httpx
from core.llm_provider import ProveedorLLM
from core.providers.anthropic_provider import ProveedorAnthropic
from core.providers.openai_provider import ProveedorOpenAI
from core.providers.google_provider import ProveedorGoogle

_DEFAULTS: dict[str, tuple[str, str]] = {
    "REGISTRO":      ("anthropic", "claude-sonnet-4-6"),
    "COMUNICACION":  ("anthropic", "claude-sonnet-4-6"),
    "SEGUIMIENTO":   ("anthropic", "claude-sonnet-4-6"),
    "PAI":           ("anthropic", "claude-sonnet-4-6"),
}

_PROVEEDORES: dict[str, type] = {
    "anthropic": ProveedorAnthropic,
    "openai":    ProveedorOpenAI,
    "google":    ProveedorGoogle,
}

# Cache de configuración (60 segundos)
_cache_config: dict | None = None
_cache_ts: float = 0
_CACHE_TTL = 60.0

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:3001")


async def _obtener_config_bd() -> dict:
    """Obtiene configuración de modelos activos desde el backend. Cachea 60s."""
    global _cache_config, _cache_ts
    ahora = time.time()
    if _cache_config is not None and (ahora - _cache_ts) < _CACHE_TTL:
        return _cache_config

    try:
        async with httpx.AsyncClient(timeout=3.0) as cliente:
            respuesta = await cliente.get(f"{BACKEND_URL}/admin/modelos-ia/configuracion-activa")
            if respuesta.status_code == 200:
                _cache_config = respuesta.json()
                _cache_ts = ahora
                return _cache_config
    except Exception:
        pass  # Backend no disponible — usar env vars

    return {}


async def obtener_proveedor(agente: str) -> ProveedorLLM:
    """
    Devuelve el proveedor LLM para el agente indicado.
    Prioridad: configuración en BD → variables de entorno → valores por defecto.
    """
    agente_upper = agente.upper()
    config_bd = await _obtener_config_bd()

    agente_lower = agente.lower()
    if agente_lower in config_bd:
        cfg = config_bd[agente_lower]
        nombre_proveedor = cfg["proveedor"]
        nombre_modelo = cfg["modelo"]
        api_key = cfg.get("apiKey")
    else:
        # Fallback a env vars
        default_p, default_m = _DEFAULTS.get(agente_upper, ("anthropic", "claude-sonnet-4-6"))
        nombre_proveedor = os.getenv(f"AGENTE_{agente_upper}_PROVEEDOR", default_p).lower()
        nombre_modelo    = os.getenv(f"AGENTE_{agente_upper}_MODELO", default_m)
        api_key = None

    clase = _PROVEEDORES.get(nombre_proveedor)
    if clase is None:
        raise ValueError(f"Proveedor '{nombre_proveedor}' no reconocido para el agente '{agente}'.")

    # Inyectar API key si viene de la BD
    if api_key:
        instancia = clase(modelo=nombre_modelo)
        instancia._api_key_override = api_key  # type: ignore[attr-defined]
        return instancia
    return clase(modelo=nombre_modelo)


async def estado_proveedores() -> dict:
    """Devuelve la configuración activa de cada agente."""
    config_bd = await _obtener_config_bd()
    estado = {}
    for agente in _DEFAULTS:
        agente_lower = agente.lower()
        if agente_lower in config_bd:
            cfg = config_bd[agente_lower]
            estado[agente_lower] = {
                "proveedor": cfg["proveedor"],
                "modelo": cfg["modelo"],
                "fuente": "base_de_datos",
            }
        else:
            default_p, default_m = _DEFAULTS[agente]
            estado[agente_lower] = {
                "proveedor": os.getenv(f"AGENTE_{agente}_PROVEEDOR", default_p),
                "modelo":    os.getenv(f"AGENTE_{agente}_MODELO", default_m),
                "fuente": "variables_de_entorno",
            }
    return estado
