import {
  IsUUID,
  IsInt,
  Min,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsIn,
} from 'class-validator';

export class RegistrarConsentimientoDto {
  @IsUUID('4', { message: 'El ID del residente debe ser un UUID válido' })
  residenteId!: string;

  @IsInt({ message: 'La versión debe ser un número entero' })
  @Min(1, { message: 'La versión debe ser al menos 1' })
  version!: number;

  @IsString({ message: 'El nombre del firmante debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre del firmante es obligatorio' })
  firmanteNombre!: string;

  @IsString({ message: 'El rol del firmante debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El rol del firmante es obligatorio' })
  @IsIn(['residente', 'representante_legal', 'tutor'], {
    message: 'El rol del firmante debe ser "residente", "representante_legal" o "tutor"',
  })
  firmanteRol!: 'residente' | 'representante_legal' | 'tutor';

  @IsOptional()
  @IsString({ message: 'El hash del PDF debe ser una cadena de texto' })
  pdfHash?: string;
}
