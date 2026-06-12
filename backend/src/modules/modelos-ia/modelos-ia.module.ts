import { Module } from '@nestjs/common';
import { ModelosIaController } from './modelos-ia.controller';
import { ModelosIaService } from './modelos-ia.service';

@Module({
  controllers: [ModelosIaController],
  providers: [ModelosIaService],
  exports: [ModelosIaService],
})
export class ModelosIaModule {}
