# Sistema de Ventas - API Backend

API REST para gestión de ventas de una pastelería. Proyecto desarrollado con NestJS, TypeORM y MySQL.

## Descripción del Proyecto

Este backend maneja todo el sistema de ventas de una tienda, incluyendo:
- Control de inventario de productos
- Gestión de usuarios (admin y vendedores)
- Registro de ventas con control de stock
- Reportes de caja por vendedor
- Autenticación con JWT

## Tecnologías Utilizadas

- **Node.js** (v18+)
- **NestJS** - Framework backend
- **TypeORM** - ORM para base de datos
- **MySQL** - Base de datos
- **JWT** - Autenticación
- **Bcrypt** - Encriptación de contraseñas
- **Swagger** - Documentación de API
- **Jest** - Testing

## Requisitos Previos

Antes de instalar, asegúrate de tener:

- Node.js (v18 o superior)
- npm o yarn
- XAMPP (o cualquier servidor MySQL)
- Un editor de código (VS Code recomendado)

## Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/Ijnacio/Prueba-3-Backend.git
cd Prueba-3-Backend
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto con:

```env
# Base de datos MySQL
DB_TYPE=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_NAME=shop_prueba_db

# JWT (cambia el secreto en producción)
JWT_SECRET=tu_secreto_super_seguro_y_muy_largo_aqui_123456789
JWT_EXPIRES=1d

# Entorno
NODE_ENV=development
PORT=3006
```

### 4. Crear la base de datos

Abre phpMyAdmin (http://localhost/phpmyadmin) y ejecuta:

```sql
CREATE DATABASE shop_prueba_db;
```

### 5. Iniciar el servidor
```bash
npm run start:dev
```

El servidor estará corriendo en: http://localhost:3006

## Documentación de la API

Una vez iniciado el servidor, puedes ver la documentación interactiva en:

**Swagger UI:** http://localhost:3006/docs

## Rutas Principales

### Autenticación
- `POST /api/v1/auth/login` - Iniciar sesión
- `GET /api/v1/auth/profile` - Ver perfil (requiere token)

### Usuarios (Solo Admin)
- `POST /api/v1/users` - Crear empleado
- `GET /api/v1/users` - Listar empleados
- `PATCH /api/v1/users/:id` - Editar empleado
- `DELETE /api/v1/users/:id` - Desactivar empleado

### Productos
- `GET /api/v1/productos` - Listar productos
- `GET /api/v1/productos/:id` - Ver detalle
- `POST /api/v1/productos` - Crear (Admin)
- `PATCH /api/v1/productos/:id` - Editar (Admin)
- `DELETE /api/v1/productos/:id` - Eliminar (Admin)

### Categorías
- `GET /api/v1/categorias` - Listar categorías
- `POST /api/v1/categorias` - Crear (Admin)
- `PATCH /api/v1/categorias/:id` - Editar (Admin)
- `DELETE /api/v1/categorias/:id` - Eliminar (Admin)

### Ventas
- `POST /api/v1/ventas` - Registrar venta
- `GET /api/v1/ventas/mis-ventas` - Mis ventas
- `GET /api/v1/ventas/mi-caja` - Mi resumen del día
- `GET /api/v1/ventas/historial-admin` - Historial (Admin)
- `GET /api/v1/ventas/caja-admin` - Cuadratura global (Admin)

### Seed (Datos de Prueba)
- `POST /api/v1/seed` - Cargar datos de ejemplo

## Usuarios de Prueba

Después de ejecutar el seed, puedes usar:

**Administrador:**
- RUT: `1-9`
- Contraseña: `admin123`

**Vendedor:**
- RUT: `2-7`
- Contraseña: `vendedor123`

## Scripts Disponibles

```bash
# Desarrollo (con hot-reload)
npm run start:dev

# Producción
npm run build
npm run start:prod

# Tests
npm test

# Linter
npm run lint
```

## Estructura del Proyecto

```
src/
├── auth/           # Autenticación JWT
├── users/          # Gestión de usuarios
├── productos/      # Inventario
├── categorias/     # Categorías de productos
├── ventas/         # Sistema de ventas
├── seed/           # Datos de prueba
└── common/         # Código compartido
```

## Dependencias Principales

```json
{
  "@nestjs/common": "^11.0.1",
  "@nestjs/config": "^4.0.2",
  "@nestjs/jwt": "^11.0.1",
  "@nestjs/typeorm": "^11.0.0",
  "@nestjs/swagger": "^11.0.2",
  "typeorm": "^0.3.20",
  "mysql2": "^3.11.4",
  "bcryptjs": "^3.0.3",
  "class-validator": "^0.14.2",
  "class-transformer": "^0.5.1"
}
```

## Características Implementadas

✅ Autenticación con JWT  
✅ Roles (Administrador y Vendedor)  
✅ CRUD completo de productos y categorías  
✅ Control de stock en tiempo real  
✅ Transacciones seguras en ventas  
✅ Cálculo automático de IVA  
✅ Múltiples medios de pago  
✅ Reportes de caja por vendedor  
✅ Soft delete de usuarios  
✅ Validaciones exhaustivas  
✅ Documentación con Swagger  
✅ Tests unitarios  

## Problemas Comunes

### Error de conexión a MySQL
Verifica que XAMPP esté corriendo y que las credenciales en `.env` sean correctas.

### Puerto 3006 en uso
Cambia el puerto en el archivo `.env`:
```env
PORT=3007
```

### Tablas no se crean automáticamente
Asegúrate que `synchronize: true` esté en `app.module.ts` (solo para desarrollo).

## Testing

Ejecutar los tests:
```bash
npm test
```

Los tests cubren:
- Autenticación y seguridad
- Creación de usuarios y encriptación
- Validación de stock
- Transacciones en ventas
- Cálculos de caja

## Autor

**Ignacio**  
Proyecto académico - Prueba 3 Backend

## Notas Adicionales

- Las contraseñas se guardan hasheadas con bcrypt
- El sistema usa soft-delete para usuarios (no se borran físicamente)
- Las transacciones aseguran consistencia en ventas
- El JWT expira en 1 día por defecto
