import {
  Controller,
  Get,
  Query,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AuditService } from '../../common/audit.service';
import { RbacGuard } from '../../common/rbac.guard';
import { Roles, PerfilUsuario } from '../../common/roles.decorator';

interface FiltrosPaginacion {
  pagina?: number;
  limite?: number;
}

@Controller('auditoria')
@UseGuards(RbacGuard)
@Roles(
  PerfilUsuario.ADMIN_CENTRO,
  PerfilUsuario.INSPECTOR,
  PerfilUsuario.SUPERADMIN,
)
export class AuditoriaController {
  private readonly logger = new Logger(AuditoriaController.name);

  constructor(
    private readonly auditService: AuditService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * GET /auditoria
   * Devuelve el registro de auditoría paginado.
   */
  @Get()
  async listar(@Query() query: FiltrosPaginacion) {
    const pagina = Math.max(1, Number(query.pagina) || 1);
    const limite = Math.min(100, Math.max(1, Number(query.limite) || 50));
    const offset = (pagina - 1) * limite;

    const [registros, [{ total }]] = await Promise.all([
      this.dataSource.query(
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

    return {
      datos: registros,
      paginacion: {
        pagina,
        limite,
        total: parseInt(total, 10),
        totalPaginas: Math.ceil(parseInt(total, 10) / limite),
      },
    };
  }

  /**
   * GET /auditoria/verificar
   * Verifica la integridad de la cadena de hashes del log de auditoría.
   */
  @Get('verificar')
  async verificar() {
    this.logger.log('Verificación de integridad del log de auditoría iniciada');
    const resultado = await this.auditService.verificarIntegridad();

    if (!resultado.integra) {
      this.logger.warn(
        `Integridad comprometida: primer error en el registro ID ${resultado.primerErrorId}`,
      );
    } else {
      this.logger.log(
        `Verificación completada: cadena íntegra con ${resultado.registros} registros`,
      );
    }

    return {
      integra: resultado.integra,
      registros: resultado.registros,
      ultimoHash: resultado.ultimoHash,
      ...(resultado.primerErrorId !== undefined && {
        primerErrorId: resultado.primerErrorId,
      }),
    };
  }
}
