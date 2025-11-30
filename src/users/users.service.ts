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
    // Buscamos el usuario y seleccionamos la password oculta para comparar
    const user = await this.usersRepository.findOne({
      where: { id, isActive: true },
      select: ['id', 'name', 'rut', 'password', 'rol'] 
    });

    if (!user) throw new NotFoundException(`Usuario #${id} no encontrado`);

    // LÓGICA DE CAMBIO DE CONTRASEÑA
    if (updateUserDto.newPassword) {
      // 1. Validar que enviaron la contraseña actual
      if (!updateUserDto.currentPassword) {
        throw new BadRequestException('Para cambiar la contraseña, debes ingresar la contraseña actual del usuario.');
      }

      // 2. Verificar que la contraseña actual sea correcta
      const isMatch = await bcryptjs.compare(updateUserDto.currentPassword, user.password);
      if (!isMatch) {
        throw new UnauthorizedException('La contraseña actual del cajero es incorrecta.');
      }

      // 3. Hashear la nueva contraseña
      updateUserDto.password = await bcryptjs.hash(updateUserDto.newPassword, 10);
    } 
    else {
      // Si no hay newPassword, nos aseguramos de no tocar el campo password
      delete updateUserDto.password;
    }

    // Limpiamos los campos auxiliares que no van a la BD
    delete updateUserDto.currentPassword;
    delete updateUserDto.newPassword;

    // Actualizamos
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