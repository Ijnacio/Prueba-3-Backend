import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { BadRequestException } from '@nestjs/common';
import * as bcryptjs from 'bcryptjs';

describe('UsersService (Gestión Personal)', () => {
  let service: UsersService;
  
  const mockUserRepo = {
    create: jest.fn((dto) => dto),
    save: jest.fn((user) => Promise.resolve({ id: 5, ...user })),
    findOne: jest.fn(), 
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    mockUserRepo.findOne.mockClear();
  });

  it('ESCENARIO: Crear Vendedor (Debe encriptar contraseña)', async () => {
    const nuevoEmpleado = { name: 'Juan', rut: '9-9', password: 'password123', rol: 'vendedor' } as any;
    
    // RUT no existe
    mockUserRepo.findOne.mockResolvedValue(null);

    const resultado = await service.create(nuevoEmpleado);

    // Verificamos que la contraseña NO se guardó como texto plano
    expect(resultado.password).not.toBe('password123');
    // Verificamos que sea un hash válido
    const esHashValido = await bcryptjs.compare('password123', resultado.password);
    expect(esHashValido).toBe(true);
  });

  it('ESCENARIO: Evitar RUT Duplicado', async () => {
    // Simulamos que el RUT ya está en la BD
    mockUserRepo.findOne.mockResolvedValue({ id: 1, rut: '9-9' });

    await expect(service.create({ rut: '9-9', password: '123' } as any))
      .rejects.toThrow(BadRequestException);
  });
});