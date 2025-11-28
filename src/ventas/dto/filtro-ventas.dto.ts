import { IsOptional, IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FiltroVentasDto {
  @ApiPropertyOptional({ description: 'Filtrar por fecha (YYYY-MM-DD)' }) 
  @IsOptional()
  @IsString()
  fecha?: string;

  @ApiPropertyOptional({ description: 'Filtrar por ID de vendedor (Solo Admin)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  vendedorId?: number;
}