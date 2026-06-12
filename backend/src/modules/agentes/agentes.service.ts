import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AgentesService {
  private readonly logger = new Logger(AgentesService.name);
  private readonly aiServiceUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.aiServiceUrl = this.configService.get<string>(
      'AI_SERVICE_URL',
      'http://localhost:3002',
    );
  }

  /**
   * Envuelve llamadas al microservicio IA con manejo de errores uniforme.
   */
  private async llamarServicioIA<T>(
    endpoint: string,
    cuerpo: Record<string, unknown>,
  ): Promise<T> {
    const url = `${this.aiServiceUrl}${endpoint}`;
    this.logger.debug(`Llamada al servicio IA: POST ${url}`);

    let respuesta: Response;
    try {
      respuesta = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cuerpo),
      });
    } catch (err) {
      this.logger.error(`Servicio IA no disponible en ${url}: ${String(err)}`);
      throw new InternalServerErrorException(
        'El servicio de inteligencia artificial no está disponible en este momento',
      );
    }

    if (!respuesta.ok) {
      const detalle = await respuesta.text().catch(() => 'Sin detalle');
      this.logger.error(`Error del servicio IA (${respuesta.status}): ${detalle}`);
      throw new InternalServerErrorException(
        `Error en el servicio de inteligencia artificial: ${respuesta.statusText}`,
      );
    }

    return respuesta.json() as Promise<T>;
  }

  /**
   * Procesa un mensaje de texto libre y genera un borrador de incidencia.
   * El profesional debe confirmar el borrador antes de guardar.
   */
  async procesarMensaje(datos: {
    mensaje: string;
    centroSlug: string;
    residenteNombre: string;
    habitacion: string;
    profesionalNombre: string;
    area: string;
  }): Promise<Record<string, unknown>> {
    return this.llamarServicioIA('/agentes/registro', {
      mensaje: datos.mensaje,
      centro_slug: datos.centroSlug,
      residente_nombre: datos.residenteNombre,
      habitacion: datos.habitacion,
      profesional_nombre: datos.profesionalNombre,
      area: datos.area,
    });
  }

  /**
   * Genera un borrador de mensaje para el familiar del residente.
   * Requiere aprobación del profesional antes de ser enviado.
   */
  async redactarMensajeFamiliar(datos: {
    tipo: string;
    resumen: string;
    centroSlug: string;
    residenteNombre: string;
    area: string;
  }): Promise<Record<string, unknown>> {
    return this.llamarServicioIA('/agentes/comunicacion-familiar', {
      tipo: datos.tipo,
      resumen: datos.resumen,
      centro_slug: datos.centroSlug,
      residente_nombre: datos.residenteNombre,
      area: datos.area,
    });
  }

  /**
   * Analiza el historial de incidencias de un residente y genera seguimiento inteligente.
   */
  async analizarResidente(
    centroSlug: string,
    residenteId: string,
  ): Promise<Record<string, unknown>> {
    return this.llamarServicioIA('/agentes/seguimiento', {
      centro_slug: centroSlug,
      residente_id: residenteId,
    });
  }

  /**
   * Genera un borrador de PAI para el residente.
   * SIEMPRE requiere revisión y firma del equipo multidisciplinar.
   */
  async generarBorradorPai(
    centroSlug: string,
    residenteId: string,
  ): Promise<Record<string, unknown>> {
    return this.llamarServicioIA('/agentes/pai', {
      centro_slug: centroSlug,
      residente_id: residenteId,
    });
  }
}
