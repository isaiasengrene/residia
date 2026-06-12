import { Module } from '@nestjs/common';
import { AgentesService } from './agentes.service';
import { AgentesController } from './agentes.controller';

@Module({
  providers: [AgentesService],
  controllers: [AgentesController],
  exports: [AgentesService],
})
export class AgentesModule {}
