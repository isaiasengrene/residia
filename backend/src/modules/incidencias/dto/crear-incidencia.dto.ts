import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsIn,
  IsBoolean,
  MaxLength,
} from 'class-validator';

export class CrearIncidenciaDto {
  @IsOptional()
  @IsUUID('4', { message: 'El ID del residente debe ser un UUID válido' })
  residenteId?: string;

  @IsString({ message: 'El tipo de incidencia debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El tipo de incidencia es obligatorio' })
  @MaxLength(100, { message: 'El tipo no puede superar los 100 caracteres' })
  tipo!: string;

  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  @MaxLength(2000, { message: 'La descripción no puede superar los 2000 caracteres' })
  descripcion!: string;

  @IsOptional()
  @IsString({ message: 'El área debe ser una cadena de texto' })
  @MaxLength(100, { message: 'El área no puede superar los 100 caracteres' })
  area?: string;

  @IsIn(['alta', 'media', 'baja'], {
    message: 'La prioridad debe ser "alta", "media" o "baja"',
  })
  prioridad!: 'alta' | 'media' | 'baja';

  @IsOptional()
  @IsString({ message: 'El informante debe ser una cadena de texto' })
  @MaxLength(200, { message: 'El informante no puede superar los 200 caracteres' })
  informa?: string;

  @IsIn(['web', 'whatsapp', 'voz'], {
    message: 'El origen debe ser "web", "whatsapp" o "voz"',
  })
  origen!: 'web' | 'whatsapp' | 'voz';

  @IsOptional()
  @IsBoolean({ message: 'El campo accionRequerida debe ser un booleano' })
  accionRequerida?: boolean;
}
