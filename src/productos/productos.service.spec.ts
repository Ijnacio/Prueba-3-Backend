import { Test, TestingModule } from '@nestjs/testing';
import { ProductosService } from './productos.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Producto } from './entities/producto.entity';
import { Categoria } from '../categorias/entities/categoria.entity';
import { NotFoundException } from '@nestjs/common';

describe('ProductosService (Gestión Inventario)', () => {
  let service: ProductosService;

  const mockProductoRepo = {
    create: jest.fn((dto) => dto),
    save: jest.fn((prod) => Promise.resolve({ id: 10, ...prod })),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockCategoriaRepo = {
    findOneBy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductosService,
        { provide: getRepositoryToken(Producto), useValue: mockProductoRepo },
        { provide: getRepositoryToken(Categoria), useValue: mockCategoriaRepo },
      ],
    }).compile();

    service = module.get<ProductosService>(ProductosService);
  });

  it('ESCENARIO: Crear Producto con Categoría Válida', async () => {
    const nuevoProducto = { nombre: 'Torta Nuez', precio: 15000, categoriaId: 5 } as any;
    
    // Simulamos que la categoría 5 SÍ existe
    mockCategoriaRepo.findOneBy.mockResolvedValue({ id: 5, nombre: 'Tortas' });

    const resultado = await service.create(nuevoProducto);

    // Debe guardar con la relación hecha
    expect(resultado).toHaveProperty('id');
    expect(mockProductoRepo.save).toHaveBeenCalled();
  });

  it('ESCENARIO: Error al crear (Categoría no existe)', async () => {
    const productoHuerfano = { nombre: 'Torta Fantasma', categoriaId: 999 } as any;
    
    // Simulamos que no encuentra la categoría
    mockCategoriaRepo.findOneBy.mockResolvedValue(null);

    await expect(service.create(productoHuerfano))
      .rejects.toThrow(NotFoundException);
  });
});