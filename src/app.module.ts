import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { VentasModule } from './ventas/ventas.module';
import { ProductosModule } from './productos/productos.module';
import { CategoriasModule } from './categorias/categorias.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    // Carga variables del archivo .env y las expone globalmente
    ConfigModule.forRoot({ isGlobal: true }),

    // Conexión a MySQL usando TypeORM con parámetros desde el .env
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true, // cambia a true solo en desarrollo si quieres que cree/actualice tablas automáticamente
    }),

    UsersModule,

    AuthModule,

    CategoriasModule,

    ProductosModule,

    VentasModule,
    
    SeedModule,
  ],
})
export class AppModule {}
