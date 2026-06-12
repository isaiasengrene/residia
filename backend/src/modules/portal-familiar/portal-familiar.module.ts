import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PortalFamiliarService } from './portal-familiar.service';
import { PortalFamiliarController } from './portal-familiar.controller';
import { FamiliarAuthGuard } from './familiar-auth.guard';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'cambiar_en_produccion'),
        signOptions: { expiresIn: '24h' },
      }),
    }),
  ],
  providers: [PortalFamiliarService, FamiliarAuthGuard],
  controllers: [PortalFamiliarController],
  exports: [PortalFamiliarService],
})
export class PortalFamiliarModule {}
