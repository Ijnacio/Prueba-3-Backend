import { IsOptional, IsString, IsInt } from 'class-validator';

export class FiltroVentasDto {
  @IsOptional()
  @IsInt()
  vendedorId?: number;

  @IsOptional()
  @IsString()
  fecha?: string; 


  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}