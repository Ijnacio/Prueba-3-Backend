import { IsArray, IsEnum, IsInt, IsOptional, IsPositive, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { MedioPago } from '../enum/medio-pago.enum';

class DetalleVentaItemDto {
  @ApiProperty({ example: 1, description: 'ID del producto a vender' })
  @IsInt()
  @IsPositive()
  productoId: number;

  @ApiProperty({ example: 2, description: 'Cantidad a llevar' })
  @IsInt()
  @Min(1)
  cantidad: number;
}

export class CreateVentaDto {
  @ApiProperty({ 
    type: [DetalleVentaItemDto], 
    description: 'Lista de productos a vender' 
  })
  @IsArray()
  @ValidateNested({ each: true }) 
  @Type(() => DetalleVentaItemDto)
  items: DetalleVentaItemDto[];

  @ApiProperty({ 
    enum: MedioPago, 
    example: MedioPago.EFECTIVO, 
    description: 'Forma de pago' 
  })
  @IsEnum(MedioPago)
  medioPago: MedioPago;

  @ApiProperty({ 
    example: 20000, 
    description: 'Dinero entregado (Solo si es efectivo)', 
    required: false 
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  montoEntregado?: number;
}