import { IsNotEmpty, IsIn, IsString, IsBoolean, IsOptional } from 'class-validator';

export class CrearModeloIaDto {
  @IsNotEmpty({ message: 'El proveedor es obligatorio' })
  @IsIn(['anthropic', 'openai', 'google'], { message: 'Proveedor no válido' })
  proveedor!: string;

  @IsNotEmpty({ message: 'El modelo es obligatorio' })
  @IsString({ message: 'El modelo debe ser una cadena de texto' })
  modelo!: string;

  @IsOptional()
  @IsString({ message: 'El alias debe ser una cadena de texto' })
  alias?: string;

  @IsNotEmpty({ message: 'El agente es obligatorio' })
  @IsIn(['registro', 'comunicacion', 'seguimiento', 'pai', 'todos'], { message: 'Agente no válido' })
  agente!: string;

  @IsNotEmpty({ message: 'La API key es obligatoria' })
  @IsString({ message: 'La API key debe ser una cadena de texto' })
  apiKey!: string;

  @IsBoolean({ message: 'El campo activo debe ser verdadero o falso' })
  @IsOptional()
  activo?: boolean;
}
