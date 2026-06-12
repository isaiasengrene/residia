import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { PaiService } from './pai.service';
import { PaiController } from './pai.controller';
import { PaiProcessor } from './pai.processor';
import { AuditService } from '../../common/audit.service';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'pai' }),
  ],
  providers: [PaiService, PaiProcessor, AuditService],
  controllers: [PaiController],
  exports: [PaiService],
})
export class PaiModule {}
