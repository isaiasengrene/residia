"""
Agente de Seguimiento Inteligente.
Analiza el historial de incidencias de un residente y genera un resumen clínico priorizado.
Usa pgvector para búsqueda semántica de patrones similares.
"""
from core.pseudonimizador import pseudonimizar_seguimiento
from core.llm_factory import obtener_proveedor
from core.db import conexion_tenant
import json

SYSTEM_PROMPT = """Eres un asistente clínico especializado en geriatría y residencias de mayores en España.
Analizas el historial de incidencias de un residente y generas un resumen de seguimiento.

REGLAS:
1. Responde siempre en español.
2. Devuelve JSON válido.
3. Identifica PATRONES (incidencias que se repiten) y TENDENCIAS (empeoramiento/mejora).
4. Prioriza por impacto en la calidad de vida y seguridad del residente.
5. Sé objetivo. No diagnosticas — describes patrones observados.
6. Sugiere acciones concretas al equipo de coordinación.

Formato:
{
  "resumen_ejecutivo": "2-3 frases",
  "patrones_detectados": ["patrón 1", "patrón 2"],
  "tendencia_general": "mejora | estable | empeoramiento",
  "alertas": ["alerta urgente si la hay"],
  "acciones_sugeridas": ["acción 1", "acción 2"],
  "periodo_analizado": "X días, Y incidencias"
}"""


async def analizar_residente(centro_slug: str, residente_id: str) -> dict:
    """Analiza el historial completo de un residente y genera seguimiento inteligente."""
    async with conexion_tenant(centro_slug) as conn:
        # Obtener datos del residente
        residente = await conn.fetchrow(
            "SELECT nombre, apellidos, habitacion FROM residentes WHERE id = $1",
            residente_id,
        )
        if not residente:
            return {"error": "Residente no encontrado"}

        # Obtener últimas 30 incidencias
        incidencias = await conn.fetch(
            """SELECT tipo, descripcion, prioridad, area, created_at::text, estado
               FROM incidencias
               WHERE residente_id = $1
               ORDER BY created_at DESC
               LIMIT 30""",
            residente_id,
        )

    if not incidencias:
        return {
            "resumen_ejecutivo": "Sin incidencias registradas en el sistema.",
            "patrones_detectados": [],
            "tendencia_general": "estable",
            "alertas": [],
            "acciones_sugeridas": ["Continuar monitorización rutinaria"],
            "periodo_analizado": "Sin datos",
        }

    # Pseudonimizar para envío a Claude
    datos_contexto = {
        "residente_nombre": f"{residente['nombre']} {residente['apellidos']}",
        "habitacion": residente["habitacion"],
    }
    historial_lista = [dict(i) for i in incidencias]
    historial_pseudo, mapa = pseudonimizar_seguimiento(historial_lista)

    prompt = f"""Historial del residente {mapa.tokenizar(datos_contexto['residente_nombre'], 'RES')}:

{json.dumps(historial_pseudo, ensure_ascii=False, indent=2)}

Genera el análisis de seguimiento."""

    proveedor = await obtener_proveedor("SEGUIMIENTO")
    respuesta = await proveedor.completar(SYSTEM_PROMPT, prompt, max_tokens=800)

    try:
        analisis = json.loads(respuesta)
    except json.JSONDecodeError:
        analisis = {"resumen_ejecutivo": respuesta, "patrones_detectados": [], "tendencia_general": "estable", "alertas": [], "acciones_sugeridas": []}

    return analisis
