import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from './entities/categoria.entity';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { ConflictException, InternalServerErrorException } from '@nestjs/common';
@Injectable()
export class CategoriasService {
  constructor(
    @InjectRepository(Categoria) private readonly categoriaRepo: Repository<Categoria>,
  ) {}

  async create(dto: CreateCategoriaDto) {
    const categoria = this.categoriaRepo.create(dto);
    return await this.categoriaRepo.save(categoria);
  }

  async findAll() {
    return await this.categoriaRepo.find();
  }

  async findOne(id: number) {
    const categoria = await this.categoriaRepo.findOneBy({ id });
    if (!categoria) throw new NotFoundException(`Categoría #${id} no encontrada`);
    return categoria;
  }

  async update(id: number, dto: UpdateCategoriaDto) {
    const categoria = await this.findOne(id);
    this.categoriaRepo.merge(categoria, dto);
    return await this.categoriaRepo.save(categoria);
  }

  async remove(id: number) {
    const categoria = await this.findOne(id);
    try {
      return await this.categoriaRepo.remove(categoria);
    } catch (error) {
      if (error.errno === 1451 || error.code === '23503') {
        throw new ConflictException('No se puede eliminar la categoría porque tiene productos asociados.');
      }
      throw new InternalServerErrorException('Error inesperado al eliminar la categoría');
    }
  }

}