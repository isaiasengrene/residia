import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { DocumentosService } from './documentos.service';
import { DocumentosProcessor } from './documentos.processor';
import { DocumentosController } from './documentos.controller';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'documentos' }),
  ],
  providers: [DocumentosService, DocumentosProcessor],
  controllers: [DocumentosController],
  exports: [DocumentosService],
})
export class DocumentosModule {}
