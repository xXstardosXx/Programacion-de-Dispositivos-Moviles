# Mis Recetas

App móvil para guardar y organizar recetas. Tiene login, grupos (tipo categorías), recetas con ingredientes e instrucciones, calificaciones y la opción de guardar recetas ajenas en tus grupos.

Stack: **Expo (React Native)** en el frontend y **Node + Express + MongoDB** en el backend.

```
Proyecto de Recetas/
├── backend/     → API REST
└── frontend/    → app móvil (Expo Router)
```

---

## Qué necesitas instalado

- Node.js 18 o superior
- pnpm (`npm install -g pnpm` o `corepack enable`)
- Cuenta en [MongoDB Atlas](https://cloud.mongodb.com) (gratis alcanza para desarrollo)
- Expo Go en el teléfono, o un emulador

No hace falta instalar MongoDB en la PC si usas Atlas.

---

## Base de datos (MongoDB Atlas)

1. Crea un cluster en Atlas (el tier gratuito sirve).
2. En **Database Access**, crea un usuario con contraseña. Anótala.
3. En **Network Access**, agrega tu IP (`Add Current IP Address`) o `0.0.0.0/0` si estás probando nomás.
4. En **Connect → Drivers**, copia la connection string. Se ve algo así:

```
mongodb+srv://usuario:CONTRASEÑA@cluster.xxxxx.mongodb.net/?appName=Recetas
```

Cámbiala un poco para el proyecto:

- Sustituye `CONTRASEÑA` por la real (sin los `<>` que trae Atlas de ejemplo).
- Antes del `?`, pon el nombre de la base: `/recetas_app`

Quedaría:

```
mongodb+srv://usuario:CONTRASEÑA@cluster.xxxxx.mongodb.net/recetas_app?retryWrites=true&w=majority
```

La base y las colecciones se crean solas cuando el backend empieza a guardar datos.

---

## Backend

```bash
cd backend
pnpm install
```

Copia el archivo de entorno. En Windows:

```powershell
copy .env.example .env
```

En Linux/Mac: `cp .env.example .env`

Edita `backend/.env`:

```env
PORT=3000
MONGODB_URI=mongodb+srv://usuario:contraseña@cluster.xxxxx.mongodb.net/recetas_app?retryWrites=true&w=majority
JWT_SECRET=una_clave_larga_y_unica
JWT_EXPIRES_IN=7d
```

Levanta el servidor:

```bash
pnpm dev
```

Si todo va bien verás `MongoDB conectado correctamente` y la URL local (por defecto `http://localhost:3000`).

Prueba rápida: abre `http://localhost:3000/api/health` en el navegador.

### Si el puerto 3000 está ocupado

El backend intenta solo con 3001, 3002, etc. La consola te dice en cuál quedó. Si pruebas desde el teléfono, actualiza el puerto también en `frontend/.env`.

Para liberar el 3000 en Windows:

```powershell
netstat -ano | findstr :3000
taskkill /PID 12345 /F
```

(reemplaza `12345` por el número que salga al final de `netstat`)

### Errores comunes de MongoDB

| Error | Qué revisar |
|-------|-------------|
| `bad auth : authentication failed` | Usuario/contraseña mal en la URI. Sin `<>` alrededor de la clave. |
| `IP not whitelisted` | Network Access en Atlas, o cambiaste de WiFi. |
| La URI sin nombre de BD | Falta `/recetas_app` antes del `?`. |

---

## Backend en Railway (opcional)

Para usar la app **sin tu PC encendida** y **desde cualquier red** (solo internet):

1. Despliega el backend en [Railway](https://railway.app) (guía: `backend/RAILWAY.md`).
2. Atlas → Network Access → `0.0.0.0/0` (Railway no tiene IP fija).
3. Obtén la URL pública: `https://tu-backend.up.railway.app/api/health`
4. En la app:
   - **Expo Go:** `EXPO_PUBLIC_API_URL=https://tu-backend.up.railway.app/api` en `frontend/.env`
   - **APK:** misma URL en `eas.json` perfil `production` → `pnpm build:apk:prod`

| Modo | URL | ¿PC encendida? | ¿Misma WiFi? |
|------|-----|----------------|--------------|
| Local | `http://TU_IP:3000/api` | Sí | Sí |
| Railway | `https://xxx.up.railway.app/api` | No | No |

---

## Frontend (Expo Go en teléfono)

```bash
cd frontend
pnpm install
```

Copia `.env.example` a `.env` y pon la IP de tu PC:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.228:3000/api
```

Cómo sacar la IP en Windows: `ipconfig` → **Dirección IPv4** del adaptador WiFi.

Importante: el teléfono y la PC tienen que estar en la **misma red**. `localhost` en el teléfono no apunta a tu computadora.

```bash
pnpm start
```

Escanea el QR con Expo Go. Si no conecta, prueba:

```bash
pnpm start -- --tunnel
```

Desde el navegador del teléfono puedes probar si llega al backend:

`http://TU_IP:3000/api/health`

Si no carga, revisa el firewall de Windows (permitir Node en red privada).

### Otras URLs según dónde corras la app

| Dónde | EXPO_PUBLIC_API_URL |
|-------|---------------------|
| Teléfono físico | `http://TU_IP:3000/api` |
| Emulador Android | `http://10.0.2.2:3000/api` |
| Simulador / web en la PC | `http://localhost:3000/api` |

---

## Probar la API con Postman

Importa `backend/postman/Recetas_API.postman_collection.json`.

Registra un usuario o haz login; la colección guarda el token solo. Después prueba grupos y recetas.

Documentación más detallada de cada endpoint: `backend/postman/HTTP_API.md`.

Endpoints que más se usan:

- `POST /api/auth/register` · `POST /api/auth/login`
- `GET /api/groups` · `POST /api/groups` · `DELETE /api/groups/:id`
- `GET /api/recipes` · `GET /api/recipes/mine` · `POST /api/recipes`
- `POST /api/recipes/:id/rate` · `POST /api/groups/:groupId/save/:recipeId`

Los que dicen [auth] llevan header `Authorization: Bearer <token>`.

---

## Cómo están relacionadas recetas y grupos

Una receta tiene un array `groups[]` con IDs de grupos. Puede estar en varios a la vez.

- Quitar una receta de un grupo no la borra, solo saca el ID del array.
- Borrar un grupo elimina en cascada las recetas que pertenecían a ese grupo.
- Las listas se ordenan por título (A–Z).

Además existe **guardar receta ajena**: puedes meter en tus grupos una receta que creó otro usuario (`POST /groups/:groupId/save/:recipeId`).

---

## Qué trae la app

**Usuarios:** registro, login JWT, perfil editable, borrar cuenta.

**Grupos:** crear, editar, borrar, color personalizado. Al borrar avisa que se van las recetas ligadas.

**Recetas:** título, imagen en base64, ingredientes con cantidad/unidad, preparación, grupos. Vista general (todas) y personal (solo las tuyas).

**Extras:** calificación con estrellas (1–5), guardar recetas de otros en tus grupos, pull-to-refresh, estados vacíos cuando no hay datos.

---

## Scripts

| Comando | Dónde | Para qué |
|---------|-------|----------|
| `pnpm dev` | backend | Servidor con recarga automática |
| `pnpm build` | backend | Compilar TypeScript |
| `pnpm start` | backend | Correr build compilado |
| `pnpm start` | frontend | Expo |
| `pnpm android` | frontend | Abrir en Android |

---

## Git y archivos sensibles

Los `.env` **no se suben** (están en `.gitignore`). Solo se versionan los `.env.example` como plantilla.

Nunca commitees la URI de Atlas con contraseña real ni el `JWT_SECRET` de producción.
