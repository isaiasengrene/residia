"""
Agente de Comunicación con Familias.
Redacta mensajes para familiares basándose en el estado del residente.
El profesional SIEMPRE aprueba antes de enviar. Nunca envía automáticamente.
"""
from core.pseudonimizador import pseudonimizar_incidencia
from core.llm_factory import obtener_proveedor

SYSTEM_PROMPT = """Eres un asistente de comunicación para residencias de mayores en España.
Redactas mensajes para familiares de residentes con un tono cálido, profesional y tranquilizador.

REGLAS:
1. Responde siempre en español correcto y natural.
2. Tono: cálido pero profesional. Nunca alarmista.
3. Sé conciso: máximo 3 párrafos.
4. No incluyas datos médicos técnicos — usa lenguaje accesible.
5. Termina siempre ofreciendo contacto con el equipo.
6. Este es un BORRADOR — el profesional debe aprobarlo antes de enviar.
7. NO uses el nombre real del residente en el texto — usa solo "su familiar"."""


async def redactar_mensaje_familiar(
    tipo_comunicacion: str,  # "actualizacion_rutina" | "incidencia_menor" | "cita_medica" | "buenas_noticias"
    resumen_situacion: str,
    datos_contexto: dict,
) -> dict:
    """Genera un borrador de mensaje para el familiar. Requiere aprobación humana."""
    datos_pseudo, mapa = pseudonimizar_incidencia(datos_contexto)

    prompt = f"""Tipo de comunicación: {tipo_comunicacion}
Situación del residente {datos_pseudo.get('residente', 'RES-XXX')} (área: {datos_pseudo.get('area', 'AREA-XXX')}):

{resumen_situacion}

Redacta el mensaje para el familiar."""

    proveedor = await obtener_proveedor("COMUNICACION")
    borrador_texto = await proveedor.completar(SYSTEM_PROMPT, prompt, max_tokens=600)

    return {
        "borrador": borrador_texto,
        "tipo": tipo_comunicacion,
        "estado": "pendiente_aprobacion",
        "aviso": "Este mensaje requiere aprobación del profesional antes de ser enviado al familiar.",
    }
