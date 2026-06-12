import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue, Job } from 'bull';

export interface EstadoTrabajo {
  id: string;
  estado: 'pendiente' | 'activo' | 'completado' | 'fallido';
  progreso: number;
  resultado?: unknown;
  error?: string;
}

const COLAS_PERMITIDAS = ['pai'] as const;
type NombreCola = (typeof COLAS_PERMITIDAS)[number];

function esCola(nombre: string): nombre is NombreCola {
  return (COLAS_PERMITIDAS as readonly string[]).includes(nombre);
}

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    @InjectQueue('pai') private readonly paiQueue: Queue,
  ) {}

  private obtenerCola(nombreCola: string): Queue {
    if (!esCola(nombreCola)) {
      throw new NotFoundException(`Cola "${nombreCola}" no existe`);
    }
    const colas: Record<NombreCola, Queue> = {
      pai: this.paiQueue,
    };
    return colas[nombreCola];
  }

  async obtenerEstado(nombreCola: string, jobId: string): Promise<EstadoTrabajo> {
    const cola = this.obtenerCola(nombreCola);

    let job: Job | null;
    try {
      job = await cola.getJob(jobId);
    } catch (error) {
      this.logger.error(`Error al obtener job ${jobId} de cola ${nombreCola}: ${String(error)}`);
      throw new NotFoundException(`Trabajo ${jobId} no encontrado en la cola ${nombreCola}`);
    }

    if (!job) {
      throw new NotFoundException(`Trabajo ${jobId} no encontrado en la cola ${nombreCola}`);
    }

    const estadoBull = await job.getState();
    const estadoNormalizado = this.normalizarEstado(estadoBull);

    const resultado: EstadoTrabajo = {
      id: String(job.id),
      estado: estadoNormalizado,
      progreso: typeof job.progress === 'function' ? 0 : ((job.progress as unknown) as number) ?? 0,
    };

    if (estadoNormalizado === 'completado') {
      resultado.resultado = job.returnvalue as unknown;
    }

    if (estadoNormalizado === 'fallido') {
      resultado.error = job.failedReason ?? 'Error desconocido';
    }

    return resultado;
  }

  private normalizarEstado(
    estado: string,
  ): 'pendiente' | 'activo' | 'completado' | 'fallido' {
    switch (estado) {
      case 'waiting':
      case 'delayed':
        return 'pendiente';
      case 'active':
        return 'activo';
      case 'completed':
        return 'completado';
      case 'failed':
        return 'fallido';
      default:
        return 'pendiente';
    }
  }
}
