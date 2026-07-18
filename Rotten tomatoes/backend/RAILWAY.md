# Desplegar el backend de QuestScore en Railway

Con Railway la API queda en internet 24/7: la app (APK o Expo Go) funciona **sin la misma WiFi** y **sin tu PC encendida**.

La base de datos sigue en **Neon**. Las portadas **no se suben** a Railway ni a Neon: solo se guardan URLs de RAWG. Railway solo hospeda la API Node.

---

## 1. Neon — permitir conexiones

Neon acepta conexiones desde cualquier IP por defecto (no hay whitelist como en otras nubes). Solo asegúrate de usar la **Pooled connection string** con `?sslmode=require`.

---

## 2. Crear el servicio en Railway

1. Entra a [railway.app](https://railway.app) e inicia sesión con GitHub.
2. **New Project → Deploy from GitHub repo** → elige tu repo.
3. **Sube primero los cambios a GitHub** (el repo debe contener `Rotten tomatoes/backend`).
4. En el servicio → **Settings → Source → Root Directory** = `Rotten tomatoes/backend`.
   - Así Railway usa el `railway.toml` que está dentro del backend y no interfiere con otros proyectos del mismo repo.
5. **Settings → Networking → Generate Domain**.

El `railway.toml` del backend ya hace:

```toml
buildCommand = "pnpm install --prod=false && pnpm build"
startCommand = "pnpm prisma:deploy && node dist/index.js"
healthcheckPath = "/api/health"
```

> `prisma:deploy` aplica las migraciones. Si prefieres, la primera vez puedes crear las tablas manualmente con `pnpm prisma:push` en local y cambiar el `startCommand` a solo `node dist/index.js`.

---

## 3. Variables de entorno en Railway

En el servicio → **Variables**:

| Variable | Valor |
|----------|--------|
| `DATABASE_URL` | Tu Pooled connection string de Neon (`...?sslmode=require`) |
| `JWT_SECRET` | Clave larga y aleatoria |
| `JWT_EXPIRES_IN` | `7d` |
| `RAWG_API_KEY` | Tu API Key gratis de [RAWG](https://rawg.io/apidocs) |
| `NODE_ENV` | `production` |

No pongas `PORT`; Railway lo asigna solo.

Guarda y espera el redeploy.

---

## 4. Sembrar los géneros (una vez)

Después del primer deploy, corre el seed. Opción sencilla desde tu PC apuntando a Neon:

```bash
cd backend
# con DATABASE_URL de Neon en tu .env
pnpm seed
```

(O usa la consola de Railway para ejecutar `pnpm seed`.)

---

## 5. Probar

```
https://TU-DOMINIO.up.railway.app/api/health
```

Debe responder:

```json
{ "status": "ok", "db": "connected", "rawg": "configured" }
```

---

## 6. Conectar la app

La URL base es `https://TU-DOMINIO.up.railway.app/api`.

### Expo Go

`frontend/.env`:

```env
EXPO_PUBLIC_API_URL=https://TU-DOMINIO.up.railway.app/api
```

### APK

`frontend/eas.json` → perfil **production** → `EXPO_PUBLIC_API_URL` con la URL de Railway, luego:

```bash
cd frontend
pnpm build:apk:prod
```

Con HTTPS no hace falta misma WiFi ni PC encendida; solo internet.

---

## Errores frecuentes

| Problema | Solución |
|----------|----------|
| Build falla en `tsc` | El build usa `pnpm install --prod=false`; haz push y redeploy |
| `Can't reach database` | Revisa `DATABASE_URL` (Pooled + `?sslmode=require`) |
| `rawg: missing` en /health | Falta `RAWG_API_KEY` en Variables |
| Géneros vacíos en la app | Corre `pnpm seed` apuntando a Neon |
| Network Error en APK | URL vieja en `eas.json`; rebuild perfil `production` |
