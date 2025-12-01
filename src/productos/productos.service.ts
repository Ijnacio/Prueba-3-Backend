import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from './entities/producto.entity';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { Categoria } from '../categorias/entities/categoria.entity';
import { ConflictException, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto) private readonly productoRepo: Repository<Producto>,
    @InjectRepository(Categoria) private readonly categoriaRepo: Repository<Categoria>,
  ) {}

  async create(dto: CreateProductoDto) {
    const categoria = await this.categoriaRepo.findOneBy({ id: dto.categoriaId });
    if (!categoria) throw new NotFoundException('Categoría no encontrada');

    const producto = this.productoRepo.create({
      ...dto,
      categoria,
    });
    
    return await this.productoRepo.save(producto);
  }

  async findAll() {
    return await this.productoRepo.find({
      relations: ['categoria'],
    });
  }

  async findOne(id: number) {
    const producto = await this.productoRepo.findOne({
      where: { id },
      relations: ['categoria'],
    });
    if (!producto) throw new NotFoundException(`Producto #${id} no encontrado`);
    return producto;
  }

  async update(id: number, dto: UpdateProductoDto) {
    const producto = await this.findOne(id);

    if (dto.categoriaId) {
      const categoria = await this.categoriaRepo.findOneBy({ id: dto.categoriaId });
      if (!categoria) throw new NotFoundException('Categoría no encontrada');
      producto.categoria = categoria;
    }

    Object.assign(producto, dto);
    
    return await this.productoRepo.save(producto);
  }
 async remove(id: number) {
    const producto = await this.findOne(id);
    try {
      return await this.productoRepo.remove(producto);
    } catch (error) {
      if (error.errno === 1451 || error.code === '23503') {
        throw new ConflictException('No se puede eliminar: El producto tiene ventas registradas en el historial.');
      }
      throw new InternalServerErrorException('Error inesperado al eliminar producto');
    }
  }
}