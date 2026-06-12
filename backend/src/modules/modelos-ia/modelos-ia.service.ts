import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { CrearModeloIaDto } from './dto/crear-modelo-ia.dto';

@Injectable()
export class ModelosIaService {
  private readonly logger = new Logger(ModelosIaService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  // ----------------------------------------------------------------
  // Cifrado / Descifrado AES-256-CBC
  // ----------------------------------------------------------------

  private cifrar(texto: string): string {
    const key = Buffer.from(
      this.configService.get<string>('ENCRYPTION_KEY') ?? '0'.repeat(64),
      'hex',
    );
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    const cifrado = Buffer.concat([cipher.update(texto, 'utf8'), cipher.final()]);
    return iv.toString('hex') + ':' + cifrado.toString('hex');
  }

  private descifrar(textoCifrado: string): string {
    const [ivHex, cifradoHex] = textoCifrado.split(':');
    const key = Buffer.from(
      this.configService.get<string>('ENCRYPTION_KEY') ?? '0'.repeat(64),
      'hex',
    );
    const iv = Buffer.from(ivHex, 'hex');
    const cifrado = Buffer.from(cifradoHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    return Buffer.concat([decipher.update(cifrado), decipher.final()]).toString('utf8');
  }

  // ----------------------------------------------------------------
  // CRUD
  // ----------------------------------------------------------------

  /**
   * Lista todos los modelos IA sin exponer las API keys.
   */
  async listar(): Promise<unknown[]> {
    const modelos = await this.dataSource.query(
      `SELECT id, proveedor, modelo, alias, agente, activo,
              latencia_ms_promedio, llamadas_totales, errores_totales,
              created_at, updated_at
       FROM shared.modelos_ia
       ORDER BY agente, created_at`,
    );
    return modelos;
  }

  /**
   * Crea un nuevo modelo IA, cifrando la API key antes de guardar.
   * Si activo=true, desactiva los demás modelos del mismo agente primero.
   */
  async crear(dto: CrearModeloIaDto): Promise<unknown> {
    const apiKeyCifrada = this.cifrar(dto.apiKey);

    const runner = this.dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();

    try {
      if (dto.activo) {
        await runner.query(
          `UPDATE shared.modelos_ia SET activo = false, updated_at = NOW()
           WHERE agente = $1 AND activo = true`,
          [dto.agente],
        );
      }

      const [nuevo] = await runner.query(
        `INSERT INTO shared.modelos_ia
           (proveedor, modelo, alias, agente, api_key_cifrada, activo)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, proveedor, modelo, alias, agente, activo,
                   latencia_ms_promedio, llamadas_totales, errores_totales,
                   created_at, updated_at`,
        [dto.proveedor, dto.modelo, dto.alias ?? null, dto.agente, apiKeyCifrada, dto.activo ?? false],
      );

      await runner.commitTransaction();
      this.logger.log(`Modelo IA creado: ${dto.proveedor}/${dto.modelo} para agente '${dto.agente}'`);
      return nuevo;
    } catch (err) {
      await runner.rollbackTransaction();
      throw err;
    } finally {
      await runner.release();
    }
  }

  /**
   * Activa un modelo, desactivando los demás del mismo agente.
   */
  async activar(id: string): Promise<unknown> {
    const runner = this.dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();

    try {
      const [modelo] = await runner.query(
        `SELECT id, agente FROM shared.modelos_ia WHERE id = $1`,
        [id],
      );
      if (!modelo) throw new NotFoundException(`Modelo con ID "${id}" no encontrado`);

      // Desactivar todos los modelos del mismo agente
      await runner.query(
        `UPDATE shared.modelos_ia SET activo = false, updated_at = NOW()
         WHERE agente = $1`,
        [modelo.agente],
      );

      // Activar el solicitado
      const [actualizado] = await runner.query(
        `UPDATE shared.modelos_ia
         SET activo = true, updated_at = NOW()
         WHERE id = $1
         RETURNING id, proveedor, modelo, alias, agente, activo,
                   latencia_ms_promedio, llamadas_totales, errores_totales,
                   created_at, updated_at`,
        [id],
      );

      await runner.commitTransaction();
      this.logger.log(`Modelo IA activado: ${id}`);
      return actualizado;
    } catch (err) {
      await runner.rollbackTransaction();
      throw err;
    } finally {
      await runner.release();
    }
  }

  /**
   * Desactiva un modelo específico.
   */
  async desactivar(id: string): Promise<unknown> {
    const [actualizado] = await this.dataSource.query(
      `UPDATE shared.modelos_ia
       SET activo = false, updated_at = NOW()
       WHERE id = $1
       RETURNING id, proveedor, modelo, alias, agente, activo,
                 latencia_ms_promedio, llamadas_totales, errores_totales,
                 created_at, updated_at`,
      [id],
    );
    if (!actualizado) throw new NotFoundException(`Modelo con ID "${id}" no encontrado`);
    this.logger.log(`Modelo IA desactivado: ${id}`);
    return actualizado;
  }

  /**
   * Elimina un modelo. Solo se puede eliminar si está inactivo.
   */
  async eliminar(id: string): Promise<{ mensaje: string }> {
    const [modelo] = await this.dataSource.query(
      `SELECT id, activo FROM shared.modelos_ia WHERE id = $1`,
      [id],
    );
    if (!modelo) throw new NotFoundException(`Modelo con ID "${id}" no encontrado`);
    if (modelo.activo) {
      throw new BadRequestException('No se puede eliminar un modelo activo. Desactívalo primero.');
    }

    await this.dataSource.query(
      `DELETE FROM shared.modelos_ia WHERE id = $1`,
      [id],
    );
    this.logger.log(`Modelo IA eliminado: ${id}`);
    return { mensaje: 'Modelo eliminado correctamente' };
  }

  /**
   * Devuelve la configuración activa por agente con API keys descifradas.
   * USO EXCLUSIVAMENTE INTERNO — nunca exponer este resultado al frontend.
   */
  async obtenerConfiguracionActiva(): Promise<Record<string, { proveedor: string; modelo: string; apiKey: string }>> {
    const modelos = await this.dataSource.query(
      `SELECT agente, proveedor, modelo, api_key_cifrada
       FROM shared.modelos_ia
       WHERE activo = true`,
    );

    const resultado: Record<string, { proveedor: string; modelo: string; apiKey: string }> = {};
    for (const m of modelos) {
      try {
        resultado[m.agente] = {
          proveedor: m.proveedor,
          modelo: m.modelo,
          apiKey: this.descifrar(m.api_key_cifrada),
        };
      } catch {
        this.logger.error(`Error al descifrar API key del modelo agente '${m.agente}'`);
      }
    }
    return resultado;
  }

  /**
   * Actualiza las métricas de rendimiento de un modelo tras cada llamada IA.
   */
  async actualizarMetricas(id: string, latencia_ms: number, exito: boolean): Promise<void> {
    await this.dataSource.query(
      `UPDATE shared.modelos_ia
       SET llamadas_totales = llamadas_totales + 1,
           errores_totales  = errores_totales + $2,
           latencia_ms_promedio = CASE
             WHEN latencia_ms_promedio IS NULL THEN $3
             ELSE ((latencia_ms_promedio * (llamadas_totales)) + $3) / (llamadas_totales + 1)
           END,
           updated_at = NOW()
       WHERE id = $1`,
      [id, exito ? 0 : 1, latencia_ms],
    );
  }
}
