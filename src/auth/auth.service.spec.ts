import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcryptjs from 'bcryptjs';

describe('AuthService (Seguridad)', () => {
  let service: AuthService;
  let usersServiceMock;

  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue('token_seguro_123'),
  };

  const mockUsersService = {
    findOneByRut: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    mockUsersService.findOneByRut.mockClear();
  });

  it('ESCENARIO: Login Exitoso (Debe entregar token)', async () => {
    // Simulamos usuario en BD con contraseña encriptada
    const passwordReal = '123456';
    const hashEnBD = await bcryptjs.hash(passwordReal, 10);
    
    mockUsersService.findOneByRut.mockResolvedValue({
      id: 1, rut: '1-9', password: hashEnBD, rol: 'admin'
    });

    const resultado = await service.login({ rut: '1-9', password: passwordReal });

    // Verificamos que devuelva el token
    expect(resultado.access_token).toBe('token_seguro_123');
  });

  it('ESCENARIO: Contraseña Incorrecta (Debe bloquear acceso)', async () => {
    // Usuario existe, pero la contraseña no coincide
    const hashEnBD = await bcryptjs.hash('contraseña_correcta', 10);
    
    mockUsersService.findOneByRut.mockResolvedValue({
      id: 1, rut: '1-9', password: hashEnBD
    });

    // Intentamos entrar con clave mala
    await expect(service.login({ rut: '1-9', password: 'clave_mala' }))
      .rejects.toThrow(UnauthorizedException);
  });
});