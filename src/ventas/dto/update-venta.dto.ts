import { IsArray, IsEnum, IsInt, IsOptional, IsPositive, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { MedioPago } from '../enum/medio-pago.enum'; 
class DetalleVentaItemDto {
  @ApiPropertyOptional()
  @IsInt()
  productoId: number;

  @ApiPropertyOptional()
  @IsInt()
  cantidad: number;
}

export class UpdateVentaDto {
  @ApiPropertyOptional({ description: 'Nuevos productos (Sobreescribe los anteriores)' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DetalleVentaItemDto)
  items?: DetalleVentaItemDto[];

  @ApiPropertyOptional({ enum: MedioPago })
  @IsOptional()
  @IsEnum(MedioPago)
  medioPago?: MedioPago;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  montoEntregado?: number;
}