import { Test, TestingModule } from '@nestjs/testing';
import { VentasService } from './ventas.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Boleta } from './entities/boleta.entity';
import { Producto } from '../productos/entities/producto.entity';
import { DataSource } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { MedioPago } from './enum/medio-pago.enum';
import { User } from '../users/entities/user.entity';

describe('VentasService (Escenarios Reales)', () => {
  let service: VentasService;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]),
  };

  const mockBoletaRepo = {
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  const mockProductoRepo = {
    findOneBy: jest.fn(),
    save: jest.fn(),
  };

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      save: jest.fn().mockImplementation((entity) => ({ id: 123, ...entity })),
      delete: jest.fn(),
      remove: jest.fn(),
    },
  };

  const mockDataSource = {
    createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VentasService,
        { provide: getRepositoryToken(Boleta), useValue: mockBoletaRepo },
        { provide: getRepositoryToken(Producto), useValue: mockProductoRepo },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<VentasService>(VentasService);
    jest.clearAllMocks();
  });

  it('ESCENARIO: Venta Exitosa en Efectivo (Debe calcular vuelto y restar stock)', async () => {
    const vendedor = { id: 1 } as User;
    const productoReal = { id: 1, nombre: 'Torta', precio: 10000, stock: 5 };
    
    mockProductoRepo.findOneBy.mockResolvedValue(productoReal);
    mockBoletaRepo.findOne.mockResolvedValue({ id: 1, total: 20000, detalles: [], vendedor: {id: 1} });

    const intentoDeVenta = {
      items: [{ productoId: 1, cantidad: 2 }], // Compra 2
      medioPago: MedioPago.EFECTIVO,
      montoEntregado: 25000, // Paga con 25 lucas
    };

    await service.crearVenta(intentoDeVenta, vendedor);

    expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
    expect(mockQueryRunner.manager.save).toHaveBeenCalledWith(
      expect.objectContaining({ stock: 3 })
    );
    expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
  });

  it('ESCENARIO: Stock Insuficiente (Debe proteger el inventario)', async () => {
    const productoAgotado = { id: 1, nombre: 'Pie de Limón', precio: 5000, stock: 1 };
    mockProductoRepo.findOneBy.mockResolvedValue(productoAgotado);

    const intentoDeVenta = {
      items: [{ productoId: 1, cantidad: 5 }],
      medioPago: MedioPago.EFECTIVO,
    };

    await expect(service.crearVenta(intentoDeVenta, { id: 1 }))
      .rejects.toThrow(BadRequestException);
      
    expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
  });

  it('ESCENARIO: Cuadrar Caja (Admin revisando Débito vs Crédito)', async () => {
    const ventasDelDia = [
      { total: 10000, medioPago: MedioPago.DEBITO },
      { total: 20000, medioPago: MedioPago.DEBITO },
      { total: 50000, medioPago: MedioPago.CREDITO },
      { total: 5000, medioPago: MedioPago.EFECTIVO },
    ];

    mockQueryBuilder.getMany.mockResolvedValue(ventasDelDia);

    const reporte = await service.resumenDelDia();

    expect(reporte.detalleCaja.bancoDebito).toBe(30000);
    expect(reporte.detalleCaja.bancoCredito).toBe(50000);
    expect(reporte.detalleCaja.efectivoEnCaja).toBe(5000);
    expect(reporte.detalleCaja.totalVendido).toBe(85000);
  });
});