"""ResidIA — Servicio de Agentes de Inteligencia Artificial"""
from fastapi import FastAPI, HTTPException, Header
from pydantic import BaseModel
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

load_dotenv()

from agentes.registro_unificado import procesar_mensaje
from agentes.comunicacion_familias import redactar_mensaje_familiar
from agentes.seguimiento_inteligente import analizar_residente
from agentes.automatizacion_pai import generar_borrador_pai


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("ResidIA — Servicio IA iniciado en el puerto", os.getenv("PORT", "3002"))
    yield
    print("ResidIA — Servicio IA detenido")


app = FastAPI(
    title="ResidIA — Servicio de Agentes IA",
    description="Microservicio de inteligencia artificial para gestión de residencias",
    version="1.0.0",
    lifespan=lifespan,
)


# --- Modelos Pydantic ---

class SolicitudRegistro(BaseModel):
    mensaje: str
    centro_slug: str
    residente_nombre: str
    habitacion: str
    profesional_nombre: str
    area: str

class SolicitudComunicacion(BaseModel):
    tipo: str
    resumen: str
    centro_slug: str
    residente_nombre: str
    area: str

class SolicitudAnalisis(BaseModel):
    centro_slug: str
    residente_id: str

class SolicitudPAI(BaseModel):
    centro_slug: str
    residente_id: str


# --- Endpoints ---

@app.get("/health")
async def health():
    return {"estado": "operativo", "servicio": "ResidIA IA"}


@app.post("/agentes/registro")
async def agente_registro(solicitud: SolicitudRegistro):
    """Convierte mensaje libre en borrador de incidencia. Requiere confirmación."""
    try:
        resultado = await procesar_mensaje(
            mensaje_original=solicitud.mensaje,
            datos_contexto={
                "residente_nombre": solicitud.residente_nombre,
                "habitacion": solicitud.habitacion,
                "profesional_nombre": solicitud.profesional_nombre,
                "area": solicitud.area,
            },
        )
        return resultado
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al procesar el mensaje: {str(e)}")


@app.post("/agentes/comunicacion-familiar")
async def agente_comunicacion(solicitud: SolicitudComunicacion):
    """Redacta borrador de mensaje para familiar. Requiere aprobación."""
    try:
        resultado = await redactar_mensaje_familiar(
            tipo_comunicacion=solicitud.tipo,
            resumen_situacion=solicitud.resumen,
            datos_contexto={
                "residente_nombre": solicitud.residente_nombre,
                "area": solicitud.area,
            },
        )
        return resultado
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al redactar mensaje: {str(e)}")


@app.post("/agentes/seguimiento")
async def agente_seguimiento(solicitud: SolicitudAnalisis):
    """Analiza historial y genera seguimiento inteligente."""
    try:
        resultado = await analizar_residente(solicitud.centro_slug, solicitud.residente_id)
        return resultado
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en el análisis: {str(e)}")


@app.post("/agentes/pai")
async def agente_pai(solicitud: SolicitudPAI):
    """Genera borrador de PAI. SIEMPRE requiere revisión del equipo multidisciplinar."""
    try:
        resultado = await generar_borrador_pai(solicitud.centro_slug, solicitud.residente_id)
        return resultado
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al generar PAI: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", "3002")))
