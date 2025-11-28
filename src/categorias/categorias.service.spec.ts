import { Test, TestingModule } from '@nestjs/testing';
import { CategoriasService } from './categorias.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Categoria } from './entities/categoria.entity';

describe('CategoriasService', () => {
  let service: CategoriasService;

  const mockRepo = {
    find: jest.fn().mockResolvedValue([{ id: 1, nombre: 'Bebidas' }]),
    create: jest.fn((dto) => dto),
    save: jest.fn((cat) => ({ id: 1, ...cat })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriasService,
        { provide: getRepositoryToken(Categoria), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<CategoriasService>(CategoriasService);
  });

  it('ESCENARIO: Listar Categorías (Para el menú)', async () => {
    const lista = await service.findAll();
    expect(lista).toHaveLength(1);
    expect(lista[0].nombre).toBe('Bebidas');
  });
});