import { IsUUID, IsObject, IsDateString, IsOptional } from 'class-validator';

export class CrearPaiDto {
  @IsUUID()
  residenteId!: string;

  @IsObject()
  contenido!: Record<string, unknown>;

  @IsDateString()
  @IsOptional()
  proximaRevision?: string;
}
