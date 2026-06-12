"""
Pseudonimizador — capa de privacidad obligatoria antes de cualquier llamada a la API de Claude.
Sustituye datos reales por tokens. Los tokens SOLO existen en memoria durante el procesamiento.
Ningún dato real sale de la infraestructura ResidIA.
"""
import hashlib
import re
from dataclasses import dataclass, field


@dataclass
class MapaTokens:
    """Mapa bidireccional: dato_real <-> token. Se destruye al finalizar cada operación."""
    real_a_token: dict[str, str] = field(default_factory=dict)
    token_a_real: dict[str, str] = field(default_factory=dict)
    contador: dict[str, int] = field(default_factory=dict)

    def tokenizar(self, valor: str, prefijo: str) -> str:
        if valor in self.real_a_token:
            return self.real_a_token[valor]
        n = self.contador.get(prefijo, 1000) + 1
        self.contador[prefijo] = n
        token = f"{prefijo}-{n}"
        self.real_a_token[valor] = token
        self.token_a_real[token] = valor
        return token

    def destokenizar(self, texto: str) -> str:
        for token, real in self.token_a_real.items():
            texto = texto.replace(token, real)
        return texto


def pseudonimizar_incidencia(datos: dict) -> tuple[dict, MapaTokens]:
    """
    Transforma una incidencia real en versión pseudonimizada para envío a Claude.

    Ejemplo:
        Real: {"residente": "Juan García", "habitacion": "12", "descripcion": "caída en el baño"}
        Token: {"residente": "RES-1001", "habitacion": "HAB-1001", "descripcion": "caída en el baño"}
    """
    mapa = MapaTokens()
    datos_pseudo = {}

    # Pseudonimizar campos de identidad
    if "residente_nombre" in datos:
        datos_pseudo["residente"] = mapa.tokenizar(datos["residente_nombre"], "RES")
    if "habitacion" in datos:
        datos_pseudo["habitacion"] = mapa.tokenizar(datos["habitacion"], "HAB")
    if "profesional_nombre" in datos:
        datos_pseudo["profesional"] = mapa.tokenizar(datos["profesional_nombre"], "PROF")
    if "area" in datos:
        datos_pseudo["area"] = mapa.tokenizar(datos["area"], "AREA")

    # Campos que NO se pseudonimizan (no contienen identidad)
    for campo in ["descripcion", "tipo", "prioridad", "origen"]:
        if campo in datos:
            datos_pseudo[campo] = datos[campo]

    return datos_pseudo, mapa


def pseudonimizar_seguimiento(historial: list[dict]) -> tuple[list[dict], MapaTokens]:
    """Pseudonimiza un historial de incidencias para búsqueda semántica."""
    mapa = MapaTokens()
    historial_pseudo = []

    for item in historial:
        pseudo, mapa_item = pseudonimizar_incidencia(item)
        # Merge maps
        mapa.real_a_token.update(mapa_item.real_a_token)
        mapa.token_a_real.update(mapa_item.token_a_real)
        historial_pseudo.append(pseudo)

    return historial_pseudo, mapa
