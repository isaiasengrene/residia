import { Module } from '@nestjs/common';
import { ExpedienteService } from './expediente.service';
import { ExpedienteController } from './expediente.controller';
import { AuditService } from '../../common/audit.service';

@Module({
  providers: [ExpedienteService, AuditService],
  controllers: [ExpedienteController],
  exports: [ExpedienteService],
})
export class ExpedienteModule {}
