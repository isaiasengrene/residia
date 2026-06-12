import { IsNotEmpty, IsString } from 'class-validator';

export class TraspasoTurnoDto {
  @IsString({ message: 'El resumen de traspaso debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El resumen del traspaso es obligatorio' })
  traspasoResumen!: string;
}
