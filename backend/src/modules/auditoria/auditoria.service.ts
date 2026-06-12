import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

interface RegistroAuditoria {
  id: number;
  timestamp_utc: string;
  accion: string;
  usuario_id: string;
  recurso_tipo: string;
  recurso_id: string;
  payload: Record<string, unknown>;
  ip_origen: string | null;
  hash_propio: string;
}

export interface ResultadoPaginado {
  datos: RegistroAuditoria[];
  paginacion: {
    pagina: number;
    limite: number;
    total: number;
    totalPaginas: number;
  };
}

@Injectable()
export class AuditoriaService {
  private readonly logger = new Logger(AuditoriaService.name);

  constructor(private readonly dataSource: DataSource) {}

  /**
   * Devuelve el registro de auditoría paginado para el tenant activo.
   * El search_path ya está establecido por el TenantMiddleware.
   */
  async listar(pagina: number, limite: number): Promise<ResultadoPaginado> {
    const offset = (pagina - 1) * limite;

    const [registros, totalResult] = await Promise.all([
      this.dataSource.query<RegistroAuditoria[]>(
        `SELECT id, timestamp_utc, accion, usuario_id, recurso_tipo,
                recurso_id, payload, ip_origen, hash_propio
         FROM audit_log
         ORDER BY timestamp_utc DESC
         LIMIT $1 OFFSET $2`,
        [limite, offset],
      ),
      this.dataSource.query<Array<{ total: string }>>(
        `SELECT COUNT(*) AS total FROM audit_log`,
      ),
    ]);

    const total = parseInt(totalResult[0]?.total ?? '0', 10);

    return {
      datos: registros,
      paginacion: {
        pagina,
        limite,
        total,
        totalPaginas: Math.ceil(total / limite),
      },
    };
  }
}
