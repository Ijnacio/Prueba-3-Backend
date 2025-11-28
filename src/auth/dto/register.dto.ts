import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Cliente Nuevo', description: 'Nombre completo' })
  @IsString()
  name: string;

  @ApiProperty({ example: '11222333-K', description: 'RUT del usuario' })
  @IsString()
  rut: string; 

  @ApiProperty({ example: 'secret123', description: 'Contraseña' })
  @IsString()
  @MinLength(6)
  password: string;
}