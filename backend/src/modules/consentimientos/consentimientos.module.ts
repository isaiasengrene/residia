import { Module } from '@nestjs/common';
import { ConsentimientosService } from './consentimientos.service';
import { ConsentimientosController } from './consentimientos.controller';
import { AuditService } from '../../common/audit.service';

@Module({
  providers: [ConsentimientosService, AuditService],
  controllers: [ConsentimientosController],
  exports: [ConsentimientosService],
})
export class ConsentimientosModule {}
