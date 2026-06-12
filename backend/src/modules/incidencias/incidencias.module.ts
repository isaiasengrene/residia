import { Module } from '@nestjs/common';
import { IncidenciasService } from './incidencias.service';
import { IncidenciasController } from './incidencias.controller';
import { AuditService } from '../../common/audit.service';

@Module({
  providers: [IncidenciasService, AuditService],
  controllers: [IncidenciasController],
  exports: [IncidenciasService],
})
export class IncidenciasModule {}
