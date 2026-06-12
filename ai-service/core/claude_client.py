"""Cliente Claude API con control de contexto y límites de seguridad."""
import anthropic
from core.pseudonimizador import MapaTokens


_cliente = None

def obtener_cliente() -> anthropic.Anthropic:
    global _cliente
    if _cliente is None:
        import os
        _cliente = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    return _cliente


async def llamar_claude(
    system_prompt: str,
    mensaje_usuario: str,
    mapa: MapaTokens | None = None,
    max_tokens: int = 1024,
) -> str:
    """
    Llama a Claude API con datos pseudonimizados.
    Si se proporciona mapa, destokeniza la respuesta antes de devolverla.
    """
    cliente = obtener_cliente()

    respuesta = cliente.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=max_tokens,
        system=system_prompt,
        messages=[{"role": "user", "content": mensaje_usuario}],
    )

    texto = respuesta.content[0].text

    # Destokenizar: restaurar datos reales en la respuesta
    if mapa:
        texto = mapa.destokenizar(texto)

    return texto
