import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcryptjs from 'bcryptjs'; 
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/uptate-user.dto'; // Asegúrate que el nombre del archivo sea correcto (update vs uptate)

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const userFound = await this.usersRepository.findOne({ 
      where: { rut: createUserDto.rut } 
    });

    if (userFound) {
      throw new BadRequestException('El RUT ya está registrado en el sistema');
    }

    const hashedPassword = await bcryptjs.hash(createUserDto.password, 10);

    const newUser = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
      isActive: true,
    });

    return await this.usersRepository.save(newUser);
  }

  async findAll() {
    return await this.usersRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' }
    });
  }

  async findOne(id: number) {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) throw new NotFoundException(`Usuario #${id} no encontrado`);
    return user;
  }

  async findByRutWithPassword(rut: string) {
    return await this.usersRepository.findOne({
      where: { rut, isActive: true },
      select: ['id', 'name', 'rut', 'password', 'rol'],
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.findOne({
      where: { id, isActive: true },
      select: ['id', 'name', 'rut', 'password', 'rol']
    });

    if (!user) throw new NotFoundException(`Usuario #${id} no encontrado`);

    if (updateUserDto.newPassword) {
      if (!updateUserDto.currentPassword) {
        throw new BadRequestException('Para cambiar la contraseña, debes ingresar la contraseña actual del usuario.');
      }

      const isMatch = await bcryptjs.compare(updateUserDto.currentPassword, user.password);
      if (!isMatch) {
        throw new UnauthorizedException('La contraseña actual del cajero es incorrecta.');
      }

      updateUserDto.password = await bcryptjs.hash(updateUserDto.newPassword, 10);
    } 
    else {
      delete updateUserDto.password;
    }

    delete updateUserDto.currentPassword;
    delete updateUserDto.newPassword;

    this.usersRepository.merge(user, updateUserDto);
    return await this.usersRepository.save(user);
  }




  async remove(id: number) {
    const user = await this.findOne(id);
    
    user.isActive = false;
    
    user.rut = `${user.rut}_BORRADO_${Date.now()}`;

    return await this.usersRepository.save(user);
  }
}