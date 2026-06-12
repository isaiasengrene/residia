import {
  Controller,
  Get,
  Query,
  UseGuards,
  Req,
  Logger,
} from '@nestjs/common';
import { AuditService } from '../../common/audit.service';
import { AuditoriaService } from './auditoria.service';
import { RbacGuard } from '../../common/rbac.guard';
import { Roles, PerfilUsuario } from '../../common/roles.decorator';
import { RequestConTenant } from '../../common/tenant.middleware';

interface FiltrosPaginacion {
  pagina?: string;
  limite?: string;
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
    private readonly auditoriaService: AuditoriaService,
  ) {}

  /**
   * GET /auditoria
   * Devuelve el registro de auditoría paginado del tenant activo.
   */
  @Get()
  async listar(
    @Query() query: FiltrosPaginacion,
    @Req() _req: RequestConTenant,
  ) {
    const pagina = Math.max(1, parseInt(query.pagina ?? '1', 10));
    const limite = Math.min(100, Math.max(1, parseInt(query.limite ?? '50', 10)));

    return this.auditoriaService.listar(pagina, limite);
  }

  /**
   * GET /auditoria/verificar
   * Verifica la integridad de la cadena de hashes del log de auditoría.
   */
  @Get('verificar')
  async verificar(@Req() _req: RequestConTenant) {
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
