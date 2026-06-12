import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { InspeccionService } from './inspeccion.service';
import { InspeccionController } from './inspeccion.controller';
import { AuditService } from '../../common/audit.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'cambiar_en_produccion'),
        signOptions: { expiresIn: '72h' },
      }),
    }),
  ],
  providers: [InspeccionService, AuditService],
  controllers: [InspeccionController],
  exports: [InspeccionService],
})
export class InspeccionModule {}
