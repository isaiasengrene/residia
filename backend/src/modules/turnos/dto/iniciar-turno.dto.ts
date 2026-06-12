import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class IniciarTurnoDto {
  @IsIn(['mañana', 'tarde', 'noche'], {
    message: 'El tipo de turno debe ser "mañana", "tarde" o "noche"',
  })
  tipo!: 'mañana' | 'tarde' | 'noche';

  @IsString({ message: 'El nombre del profesional debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre del profesional es obligatorio' })
  profesionalNombre!: string;
}
