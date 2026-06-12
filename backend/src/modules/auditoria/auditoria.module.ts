import { Module } from '@nestjs/common';
import { AuditoriaController } from './auditoria.controller';
import { AuditoriaService } from './auditoria.service';
import { AuditService } from '../../common/audit.service';

@Module({
  providers: [AuditService, AuditoriaService],
  controllers: [AuditoriaController],
})
export class AuditoriaModule {}
