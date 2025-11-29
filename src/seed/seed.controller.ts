import { Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SeedService } from './seed.service';

@ApiTags('Seed (Carga de Datos)')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post()
  @ApiOperation({ summary: 'EJECUTAR SEED: Llena la BD con datos de prueba' })
  @ApiResponse({ status: 201, description: 'Datos cargados correctamente.' })
  executeSeed() {
    // Llama a la función principal de tu servicio
    return this.seedService.ejecutarSeed();
  }
}