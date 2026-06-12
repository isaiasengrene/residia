import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { PortalFamiliarService, ResidentePublico, IncidenciaFamiliar, ComunicacionFamiliar } from './portal-familiar.service';
import { FamiliarAuthGuard, RequestConFamiliar } from './familiar-auth.guard';

interface LoginFamiliarDto {
  email: string;
  centroSlug: string;
}

interface EnviarMensajeDto {
  texto: string;
}

@Controller('portal-familiar')
export class PortalFamiliarController {
  constructor(private readonly portalFamiliarService: PortalFamiliarService) {}

  /**
   * POST /portal-familiar/login
   * Endpoint público — emite JWT para familiar (scope='familiar').
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: LoginFamiliarDto) {
    const { email, centroSlug } = body;

    if (!email || !centroSlug) {
      throw new BadRequestException(
        'El correo electrónico y el identificador del centro son obligatorios',
      );
    }

    return this.portalFamiliarService.loginFamiliar(email, centroSlug);
  }

  /**
   * GET /portal-familiar/residente
   * Requiere JWT familiar — devuelve datos básicos del residente.
   */
  @Get('residente')
  @UseGuards(FamiliarAuthGuard)
  async residente(@Req() req: RequestConFamiliar): Promise<ResidentePublico> {
    const { id, centroSlug } = req.familiar!;
    return this.portalFamiliarService.obtenerResidente(id, centroSlug);
  }

  /**
   * GET /portal-familiar/incidencias
   * Requiere JWT familiar — devuelve últimas 10 incidencias (sin datos clínicos).
   */
  @Get('incidencias')
  @UseGuards(FamiliarAuthGuard)
  async incidencias(@Req() req: RequestConFamiliar): Promise<IncidenciaFamiliar[]> {
    const { id, centroSlug } = req.familiar!;
    return this.portalFamiliarService.obtenerIncidencias(id, centroSlug);
  }

  /**
   * GET /portal-familiar/comunicaciones
   * Requiere JWT familiar — devuelve últimas 10 comunicaciones.
   */
  @Get('comunicaciones')
  @UseGuards(FamiliarAuthGuard)
  async comunicaciones(@Req() req: RequestConFamiliar): Promise<ComunicacionFamiliar[]> {
    const { id, centroSlug } = req.familiar!;
    return this.portalFamiliarService.obtenerComunicaciones(id, centroSlug);
  }

  /**
   * POST /portal-familiar/mensaje
   * Requiere JWT familiar — envía mensaje al centro.
   */
  @Post('mensaje')
  @UseGuards(FamiliarAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async mensaje(
    @Req() req: RequestConFamiliar,
    @Body() body: EnviarMensajeDto,
  ) {
    const { id, centroSlug } = req.familiar!;

    if (!body.texto || body.texto.trim().length === 0) {
      throw new BadRequestException('El mensaje no puede estar vacío');
    }

    return this.portalFamiliarService.enviarMensaje(id, centroSlug, body.texto.trim());
  }
}
