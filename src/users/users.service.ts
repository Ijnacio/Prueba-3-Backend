import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcryptjs from 'bcryptjs'; 
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const userFound = await this.findOneByRut(createUserDto.rut);
    if (userFound) {
      throw new BadRequestException('El RUT ya está registrado en el sistema');
    }

    const hashedPassword = await bcryptjs.hash(createUserDto.password, 10);

    const newUser = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return await this.usersRepository.save(newUser);
  }

  async findAll() {
    return await this.usersRepository.find();
  }

  // --- AQUÍ ESTÁ EL ARREGLO ---
  async findOneByRut(rut: string) {
    return await this.usersRepository.findOne({
      where: { rut },
      // Forzamos que traiga la password para poder comparar en el login
      select: ['id', 'name', 'rut', 'password', 'rol', 'createdAt', 'updatedAt'], 
    });
  }

  async findOneById(id: number) {
    return await this.usersRepository.findOneBy({ id });
  }
}