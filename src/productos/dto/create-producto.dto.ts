import { IsInt, IsOptional, IsPositive, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductoDto {
  @ApiProperty({ example: 'Torta de Chocolate', description: 'Nombre del producto' })
  @IsString()
  nombre: string;

  @ApiProperty({ example: 'Bizcocho húmedo con relleno de manjar', required: false })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({ example: 15000, description: 'Precio en pesos chilenos' })
  @IsInt()
  @IsPositive()
  precio: number;

  @ApiProperty({ example: 10, description: 'Cantidad disponible en inventario' })
  @IsInt()
  @Min(0)
  stock: number;

  @ApiProperty({ example: '/public/torta-choco.png', description: 'URL de la foto (Local o Internet)' })
  @IsString()
  @IsOptional()
  fotoUrl?: string;

  @ApiProperty({ example: 1, description: 'ID de la categoría a la que pertenece' })
  @IsInt()
  @IsPositive()
  categoriaId: number;
}