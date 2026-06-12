import { IsOptional, IsString } from 'class-validator';

export class CerrarTurnoDto {
  @IsOptional()
  @IsString({ message: 'Las notas deben ser una cadena de texto' })
  notas?: string;

  @IsOptional()
  @IsString({ message: 'El hash de firma debe ser una cadena de texto' })
  firmaHash?: string;
}
