import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class CrearResidenteDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(100, { message: 'El nombre no puede superar los 100 caracteres' })
  nombre!: string;

  @IsString({ message: 'Los apellidos deben ser una cadena de texto' })
  @IsNotEmpty({ message: 'Los apellidos son obligatorios' })
  @MaxLength(200, { message: 'Los apellidos no pueden superar los 200 caracteres' })
  apellidos!: string;

  @IsDateString({}, { message: 'La fecha de nacimiento debe tener formato AAAA-MM-DD' })
  @IsNotEmpty({ message: 'La fecha de nacimiento es obligatoria' })
  fechaNacimiento!: string;

  @IsOptional()
  @IsString({ message: 'La habitación debe ser una cadena de texto' })
  @MaxLength(20, { message: 'La habitación no puede superar los 20 caracteres' })
  habitacion?: string;
}
