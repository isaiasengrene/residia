"""
Agente de Automatización PAI (Plan de Atención Individualizada).
Genera borradores de PAI basándose en el historial del residente.
SIEMPRE requiere revisión y firma del equipo multidisciplinar.
Nunca toma decisiones clínicas de forma autónoma.
"""
from core.pseudonimizador import pseudonimizar_seguimiento, pseudonimizar_incidencia
from core.claude_client import llamar_claude
from core.db import conexion_tenant
import json

SYSTEM_PROMPT = """Eres un asistente para la elaboración del Plan de Atención Individualizada (PAI)
en residencias de mayores de España, conforme al modelo biopsicosocial.

REGLAS CRÍTICAS:
1. Responde siempre en español.
2. Devuelve JSON válido.
3. Eres un BORRADOR que DEBE ser revisado por el equipo multidisciplinar antes de su aprobación.
4. No diagnostiques. Describe necesidades observadas y objetivos de cuidado.
5. Sé específico y medible en los objetivos.
6. Considera áreas: movilidad, alimentación, higiene, cognitiva, social, emocional, médica.

Formato de respuesta:
{
  "areas": {
    "movilidad": {"estado": "descripción", "objetivos": [], "intervenciones": []},
    "alimentacion": {"estado": "descripción", "objetivos": [], "intervenciones": []},
    "higiene": {"estado": "descripción", "objetivos": [], "intervenciones": []},
    "cognitiva": {"estado": "descripción", "objetivos": [], "intervenciones": []},
    "social": {"estado": "descripción", "objetivos": [], "intervenciones": []},
    "emocional": {"estado": "descripción", "objetivos": [], "intervenciones": []}
  },
  "resumen_global": "estado general del residente",
  "prioridades_inmediatas": ["prioridad 1", "prioridad 2"],
  "revision_sugerida": "fecha sugerida para próxima revisión del PAI",
  "aviso_legal": "Este borrador requiere revisión y firma del equipo multidisciplinar. No tiene validez clínica sin aprobación."
}"""


async def generar_borrador_pai(centro_slug: str, residente_id: str) -> dict:
    """Genera borrador de PAI. SIEMPRE requiere aprobación del equipo."""
    async with conexion_tenant(centro_slug) as conn:
        residente = await conn.fetchrow(
            "SELECT nombre, apellidos, habitacion, fecha_nacimiento FROM residentes WHERE id = $1",
            residente_id,
        )
        incidencias = await conn.fetch(
            """SELECT tipo, descripcion, area, prioridad, created_at::text
               FROM incidencias WHERE residente_id = $1
               ORDER BY created_at DESC LIMIT 50""",
            residente_id,
        )

    datos_contexto = {
        "residente_nombre": f"{residente['nombre']} {residente['apellidos']}",
        "habitacion": residente["habitacion"],
    }
    historial_pseudo, mapa = pseudonimizar_seguimiento([dict(i) for i in incidencias])
    token_res = mapa.tokenizar(datos_contexto["residente_nombre"], "RES")

    prompt = f"""Residente: {token_res}
Historial de incidencias (últimas 50):
{json.dumps(historial_pseudo, ensure_ascii=False, indent=2)}

Genera el borrador del PAI."""

    respuesta = await llamar_claude(SYSTEM_PROMPT, prompt, max_tokens=2000)

    try:
        pai = json.loads(respuesta)
    except json.JSONDecodeError:
        pai = {"error": "No se pudo generar el borrador", "texto_raw": respuesta}

    pai["estado"] = "borrador_pendiente_revision"
    pai["residente_id"] = residente_id
    return pai
