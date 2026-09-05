# Task Manager
 
Una solución para la organización y seguimiento de proyectos y tareas diarias.
 
<!-- BADGE_CI -->
 
## 🚀 Instalación local
 
```bash
git clone https://github.com/login/device/success
cd task-manager
npm install
```
 
### Variables de entorno
Crea un archivo `.env` en la raíz con las siguientes claves:
 
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nombre_bd"
PORT=3000
JWT_SECRET=clave_secreta_super_segura
```
 
## 📜 Comandos disponibles
 
| Comando          | Descripción                                |
|------------------|------------------------------------------- |
| `npm run dev`    | Levanta el entorno de desarrollo           |
| `npm run build`  | Genera el build de producción              |
| `npm test`       | Corre las pruebas automatizadas (pendiente — Sesión 3) |
 
## 🗄️ Base de datos
 
PostgreSQL con migraciones y seeds gestionados con Prisma.
### 1. Configura tu variable DATABASE_URL en el archivo .env
DATABASE_URL="postgresql://USUARIO:PASSWORD@localhost:5432/task_manager_db?schema=public"

### 2. Ejecutar las migraciones para crear las tablas
npx prisma migrate dev

### 3. Poblado inicial de datos (seeding)
npx prisma db seed

### 4. (Opcional) Abrir el cliente gráfico de Prisma
npx prisma studio