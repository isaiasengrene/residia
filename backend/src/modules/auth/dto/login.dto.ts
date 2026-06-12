import { IsEmail, IsString, IsNotEmpty, Length, IsOptional, Matches } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'El correo electrónico no tiene un formato válido' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  email!: string;

  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @Length(8, 128, {
    message: 'La contraseña debe tener entre 8 y 128 caracteres',
  })
  password!: string;

  @IsOptional()
  @IsString({ message: 'El código 2FA debe ser una cadena de texto' })
  @Matches(/^\d{6}$/, {
    message: 'El código de doble factor debe ser un número de 6 dígitos',
  })
  codigo2fa?: string;
}
