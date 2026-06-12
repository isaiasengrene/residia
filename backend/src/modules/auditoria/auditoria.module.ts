import { Module } from '@nestjs/common';
import { AuditoriaController } from './auditoria.controller';
import { AuditService } from '../../common/audit.service';

@Module({
  providers: [AuditService],
  controllers: [AuditoriaController],
})
export class AuditoriaModule {}
