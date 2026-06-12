import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

export interface WhatsappWebhookPayload {
  object?: string;
  entry?: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata: { display_phone_number: string; phone_number_id: string };
        contacts?: Array<{ profile: { name: string }; wa_id: string }>;
        messages?: Array<{
          from: string;
          id: string;
          timestamp: string;
          text?: { body: string };
          type: string;
        }>;
      };
      field: string;
    }>;
  }>;
}

interface MensajeExtraido {
  from: string;
  texto: string;
  timestamp: string;
  messageId: string;
}

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Verifica el webhook de Meta según el protocolo de verificación.
   * Devuelve hub.challenge si el token es correcto.
   */
  verificar(mode: string, token: string, challenge: string): string | null {
    const tokenEsperado = this.configService.get<string>('WHATSAPP_VERIFY_TOKEN');

    if (mode === 'subscribe' && token === tokenEsperado) {
      this.logger.log('Webhook de WhatsApp verificado correctamente');
      return challenge;
    }

    this.logger.warn(`Intento de verificación de webhook con token inválido`);
    return null;
  }

  /**
   * Procesa un mensaje entrante de WhatsApp.
   * Extrae el mensaje, llama al agente IA y guarda el borrador.
   */
  async procesarMensaje(payload: WhatsappWebhookPayload): Promise<void> {
    const mensajes = this.extraerMensajes(payload);

    for (const mensaje of mensajes) {
      try {
        await this.procesarUnMensaje(mensaje);
      } catch (error) {
        this.logger.error(
          `Error al procesar mensaje de WhatsApp desde ${mensaje.from}: ${String(error)}`,
        );
      }
    }
  }

  private extraerMensajes(payload: WhatsappWebhookPayload): MensajeExtraido[] {
    const mensajes: MensajeExtraido[] = [];

    for (const entry of payload.entry ?? []) {
      for (const change of entry.changes ?? []) {
        for (const msg of change.value.messages ?? []) {
          if (msg.type === 'text' && msg.text?.body) {
            mensajes.push({
              from: msg.from,
              texto: msg.text.body,
              timestamp: msg.timestamp,
              messageId: msg.id,
            });
          }
        }
      }
    }

    return mensajes;
  }

  private async procesarUnMensaje(mensaje: MensajeExtraido): Promise<void> {
    this.logger.log(
      `Mensaje entrante de WhatsApp — de: ${mensaje.from}, texto: "${mensaje.texto.substring(0, 60)}..."`,
    );

    // Determinar el centro a partir del número de teléfono
    // En producción se resolvería con una tabla de mapeo; por ahora usar valor por defecto
    const centroSlug = await this.resolverCentro(mensaje.from);

    if (!centroSlug) {
      this.logger.warn(
        `No se encontró centro para el número ${mensaje.from}. Mensaje descartado.`,
      );
      return;
    }

    const schemaName = `centro_${centroSlug}`;
    await this.dataSource.query(
      `SET search_path TO ${schemaName}, shared, public`,
    );

    // Llamar al microservicio de IA para procesar el mensaje
    let borradorIa: Record<string, unknown> = {};
    try {
      const respuestaIa = await fetch('http://localhost:3002/agentes/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          centro_slug: centroSlug,
          mensaje: mensaje.texto,
          origen: 'whatsapp',
          telefono: mensaje.from,
        }),
      });

      if (respuestaIa.ok) {
        borradorIa = (await respuestaIa.json()) as Record<string, unknown>;
      } else {
        this.logger.warn(
          `Servicio IA devolvió ${respuestaIa.status}. Guardando mensaje sin procesar.`,
        );
      }
    } catch (error) {
      this.logger.warn(`Microservicio IA no disponible: ${String(error)}`);
    }

    // Guardar incidencia con estado 'borrador_whatsapp' (pendiente de confirmación)
    await this.dataSource.query(
      `INSERT INTO incidencias
         (tipo, descripcion, area, prioridad, informa, origen, estado, accion_requerida, created_at)
       VALUES
         ($1, $2, $3, $4, $5, 'whatsapp', 'borrador_whatsapp', false, NOW())`,
      [
        (borradorIa.tipo as string | undefined) ?? 'Sin clasificar',
        mensaje.texto,
        (borradorIa.area as string | undefined) ?? null,
        (borradorIa.prioridad as string | undefined) ?? 'media',
        mensaje.from,
      ],
    );

    this.logger.log(
      `Borrador de incidencia WhatsApp guardado (centro: ${centroSlug}, de: ${mensaje.from})`,
    );
  }

  /**
   * Resuelve el centro correspondiente a un número de teléfono.
   * Consulta la tabla de configuración; devuelve null si no se encuentra.
   */
  private async resolverCentro(telefono: string): Promise<string | null> {
    try {
      // Intentar buscar en la tabla de mapeo de teléfonos a centros
      const [resultado] = await this.dataSource.query<Array<{ centro_slug: string }>>(
        `SELECT c.slug AS centro_slug
         FROM shared.centros c
         WHERE c.whatsapp_numero = $1
         LIMIT 1`,
        [telefono],
      );

      return resultado?.centro_slug ?? null;
    } catch {
      // Si la tabla no tiene la columna o falla, usar configuración
      const slugDefault = this.configService.get<string>('WHATSAPP_DEFAULT_CENTRO');
      return slugDefault ?? null;
    }
  }
}
