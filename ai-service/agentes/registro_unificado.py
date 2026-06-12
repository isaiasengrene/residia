"""
Agente de Registro Unificado.
Convierte mensajes de WhatsApp / texto libre / voz en una incidencia estructurada.
El profesional confirma el borrador antes de que se guarde definitivamente.
"""
from core.pseudonimizador import pseudonimizar_incidencia, MapaTokens
from core.llm_factory import obtener_proveedor

SYSTEM_PROMPT = """Eres un asistente especializado en residencias de personas mayores en España.
Tu única función es convertir mensajes de profesionales sanitarios en registros estructurados de incidencias.

REGLAS ESTRICTAS:
1. Responde SIEMPRE en español.
2. Devuelve SOLO JSON válido, sin texto adicional.
3. Nunca inventes información que no esté en el mensaje original.
4. Si falta información, usa null en ese campo.
5. Eres un BORRADOR — el profesional debe confirmar antes de guardar.

Formato de respuesta:
{
  "tipo": "caída | comportamiento | alimentación | medicación | higiene | otro",
  "descripcion": "descripción objetiva en 1-2 frases",
  "prioridad": "alta | media | baja",
  "accion_requerida": true | false,
  "accion_sugerida": "qué hacer a continuación (o null)",
  "confianza": 0.0-1.0
}"""


async def procesar_mensaje(
    mensaje_original: str,
    datos_contexto: dict,  # residente_nombre, habitacion, profesional_nombre, area
) -> dict:
    """
    Procesa un mensaje de texto libre y genera un borrador de incidencia.
    Los datos de identidad se pseudonimizan antes de enviar a Claude.
    """
    datos_pseudo, mapa = pseudonimizar_incidencia(datos_contexto)

    prompt = f"""Mensaje del profesional {datos_pseudo.get('profesional', 'PROF-XXX')}
sobre el residente {datos_pseudo.get('residente', 'RES-XXX')} (habitación {datos_pseudo.get('habitacion', 'HAB-XXX')}):

"{mensaje_original}"

Genera el registro de incidencia estructurado."""

    proveedor = await obtener_proveedor("REGISTRO")
    respuesta_json = await proveedor.completar(SYSTEM_PROMPT, prompt, max_tokens=512)

    import json
    try:
        borrador = json.loads(respuesta_json)
    except json.JSONDecodeError:
        # Si Claude no devuelve JSON válido, extraer manualmente
        borrador = {
            "tipo": "otro",
            "descripcion": mensaje_original[:500],
            "prioridad": "media",
            "accion_requerida": False,
            "accion_sugerida": None,
            "confianza": 0.5,
        }

    # Destokenizar: los datos reales se añaden aquí, nunca se enviaron a Claude
    borrador["contexto"] = datos_contexto
    borrador["mensaje_original"] = mensaje_original
    borrador["estado"] = "pendiente_confirmacion"

    return borrador
