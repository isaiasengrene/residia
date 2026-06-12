import { Module } from '@nestjs/common';
import { TurnosService } from './turnos.service';
import { TurnosController } from './turnos.controller';
import { AuditService } from '../../common/audit.service';

@Module({
  providers: [TurnosService, AuditService],
  controllers: [TurnosController],
  exports: [TurnosService],
})
export class TurnosModule {}
