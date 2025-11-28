import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoriaDto {
  @ApiProperty({ example: 'Tortas', description: 'Nombre de la categoría' })
  @IsString()
  nombre: string;

  @ApiProperty({ example: 'Productos dulces', required: false })
  @IsString()
  @IsOptional()
  descripcion?: string;
}