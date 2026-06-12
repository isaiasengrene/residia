import { Module } from '@nestjs/common';
import { ResidentesService } from './residentes.service';
import { ResidentesController } from './residentes.controller';
import { AuditService } from '../../common/audit.service';

@Module({
  providers: [ResidentesService, AuditService],
  controllers: [ResidentesController],
  exports: [ResidentesService],
})
export class ResidentesModule {}
