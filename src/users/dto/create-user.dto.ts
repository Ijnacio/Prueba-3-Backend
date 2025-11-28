import { IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../common/enums/roles.enum';

export class CreateUserDto {
  @ApiProperty({ example: 'Juan Vendedor', description: 'Nombre del empleado' })
  @IsString()
  name: string;

  @ApiProperty({ example: '12345678-9', description: 'RUT del vendedor (Será su usuario)' })
  @IsString()
  rut: string;

  @ApiProperty({ example: '123456', description: 'Contraseña de acceso' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ 
    example: UserRole.VENDEDOR, 
    enum: UserRole, 
    description: 'Rol en el sistema (ADMIN o VENDEDOR)' 
  })
  @IsEnum(UserRole)
  rol: UserRole;
}