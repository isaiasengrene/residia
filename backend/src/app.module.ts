import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';

import { TenantMiddleware } from './common/tenant.middleware';
import { CommonModule } from './common/common.module';
import { AuthModule } from './modules/auth/auth.module';
import { ResidentesModule } from './modules/residentes/residentes.module';
import { IncidenciasModule } from './modules/incidencias/incidencias.module';
import { AuditoriaModule } from './modules/auditoria/auditoria.module';
import { AdminModule } from './modules/admin/admin.module';
import { ConsentimientosModule } from './modules/consentimientos/consentimientos.module';
import { ExpedienteModule } from './modules/expediente/expediente.module';
import { TurnosModule } from './modules/turnos/turnos.module';
import { AgentesModule } from './modules/agentes/agentes.module';
import { ModelosIaModule } from './modules/modelos-ia/modelos-ia.module';
import { PaiModule } from './modules/pai/pai.module';
import { JobsModule } from './modules/jobs/jobs.module';

@Module({
  imports: [
    // Configuración global desde variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Base de datos PostgreSQL (multi-tenant via search_path)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USER', 'residia'),
        password: config.get<string>('DB_PASSWORD', 'residia_dev'),
        database: config.get<string>('DB_NAME', 'residia'),
        entities: [],
        synchronize: false, // Solo migraciones manuales en producción
        logging: config.get<string>('NODE_ENV') === 'development',
        extra: {
          // Pool de conexiones para multi-tenant
          max: 20,
          idleTimeoutMillis: 30000,
        },
      }),
    }),

    // Cola de trabajos con Redis
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get<string>('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
        },
      }),
    }),

    // Módulos de negocio
    CommonModule,
    AuthModule,
    ResidentesModule,
    IncidenciasModule,
    AuditoriaModule,
    AdminModule,
    ConsentimientosModule,
    ExpedienteModule,
    TurnosModule,
    AgentesModule,
    ModelosIaModule,
    PaiModule,
    JobsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // El middleware de tenant aplica a todas las rutas excepto /auth/*
    consumer
      .apply(TenantMiddleware)
      .exclude({ path: 'auth/(.*)', method: RequestMethod.ALL })
      .forRoutes('*');
  }
}
