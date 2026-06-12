import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { AuthService, RespuestaLogin } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/login
   * Autentica al usuario y devuelve un JWT con los datos del tenant.
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto): Promise<RespuestaLogin> {
    this.logger.log(`Solicitud de inicio de sesión para: ${dto.email}`);
    return this.authService.login(dto.email, dto.password, dto.codigo2fa);
  }
}
