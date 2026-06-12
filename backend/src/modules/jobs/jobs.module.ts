import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'pai' }),
  ],
  providers: [JobsService],
  controllers: [JobsController],
})
export class JobsModule {}
