import { IsOptional, IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FiltroVentasDto {
  @ApiPropertyOptional({ description: 'Filtrar por fecha (YYYY-MM-DD)', example: '2025-11-28' })
  @IsOptional()
  @IsString()
  fecha?: string;

  @ApiPropertyOptional({ description: 'Filtrar por ID de vendedor (Solo Admin)', example: 1 })
  @IsOptional()
  @Type(() => Number) // Convierte el string de la URL a número
  @IsInt()
  vendedorId?: number;
}