import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { RbacGuard } from '../../common/rbac.guard';
import { Roles, PerfilUsuario } from '../../common/roles.decorator';

@Controller('jobs')
@UseGuards(RbacGuard)
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  /**
   * GET /jobs/:cola/:jobId — consultar estado de un trabajo asíncrono
   */
  @Get(':cola/:jobId')
  @Roles(
    PerfilUsuario.SANITARIO,
    PerfilUsuario.COORDINADOR,
    PerfilUsuario.ADMIN_CENTRO,
    PerfilUsuario.TRABAJADOR_SOCIAL,
    PerfilUsuario.AUXILIAR,
  )
  obtenerEstado(
    @Param('cola') cola: string,
    @Param('jobId') jobId: string,
  ) {
    return this.jobsService.obtenerEstado(cola, jobId);
  }
}
