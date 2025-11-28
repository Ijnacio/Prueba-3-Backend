import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from './entities/producto.entity';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { Categoria } from '../categorias/entities/categoria.entity';

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto) private readonly productoRepo: Repository<Producto>,
    @InjectRepository(Categoria) private readonly categoriaRepo: Repository<Categoria>,
  ) {}

  // 1. CREATE: Crear producto validando categoría
  async create(dto: CreateProductoDto) {
    // Verificamos que la categoría exista
    const categoria = await this.categoriaRepo.findOneBy({ id: dto.categoriaId });
    if (!categoria) throw new NotFoundException('Categoría no encontrada');

    const producto = this.productoRepo.create({
      ...dto,
      categoria, // Asociamos la relación
    });
    
    return await this.productoRepo.save(producto);
  }

  // 2. READ ALL: Listar todos (con su categoría visible)
  async findAll() {
    return await this.productoRepo.find({
      relations: ['categoria'], // Truco para que te traiga el nombre de la categoría
    });
  }

  // 3. READ ONE: Buscar uno solo por ID
  async findOne(id: number) {
    const producto = await this.productoRepo.findOne({
      where: { id },
      relations: ['categoria'],
    });
    if (!producto) throw new NotFoundException(`Producto #${id} no encontrado`);
    return producto;
  }

  // 4. UPDATE: Editar datos
  async update(id: number, dto: UpdateProductoDto) {
    const producto = await this.findOne(id); // Reutilizamos el buscar
    
    // Si quieren cambiar la categoría, la buscamos de nuevo
    if (dto.categoriaId) {
      const categoria = await this.categoriaRepo.findOneBy({ id: dto.categoriaId });
      if (!categoria) throw new NotFoundException('Categoría no encontrada');
      producto.categoria = categoria;
    }

    // Actualizamos los campos (fusionamos lo viejo con lo nuevo)
    Object.assign(producto, dto);
    
    return await this.productoRepo.save(producto);
  }

  // 5. DELETE: Borrar de la base de datos
  async remove(id: number) {
    const producto = await this.findOne(id);
    return await this.productoRepo.remove(producto);
  }
}