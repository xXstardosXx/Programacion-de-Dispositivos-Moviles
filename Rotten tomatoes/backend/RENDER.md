# Desplegar el backend de QuestScore en Render

Con Render la API queda en internet: el APK (Ionic + Capacitor) funciona
**sin la misma WiFi** y **sin tu PC encendida**.

La base de datos sigue en **Neon**. Las portadas **no se suben** a Render:
solo se guardan URLs de RAWG. Render solo hospeda la API Node.

> En producción **no uses** `localhost` ni tu IP local (`192.168.x.x`).
> Usa la URL `https://….onrender.com/api`.

---

## 1. Neon

Usa la **Pooled connection string** con `sslmode=require` y, recomendado,
`connect_timeout=30` como `DATABASE_URL`.

---

## 2. Subir el código a GitHub

Desde la raíz del repo (o de `Rotten tomatoes`), haz commit y push de
backend + frontend Ionic (sin `.env`).

---

## 3. Crear el Web Service en Render

1. Entra a [render.com](https://render.com) e inicia sesión con GitHub.
2. **New → Web Service** → conecta este repo.
3. Configura:

| Campo | Valor |
|-------|--------|
| **Root Directory** | `Rotten tomatoes/backend` |
| **Runtime** | Node |
| **Build Command** | `npm install --include=dev && npm run build` |
| **Start Command** | `npx prisma db push && node dist/index.js` |
| **Health Check Path** | `/api/health` |

4. Plan **Free** está bien para la materia (se duerme tras inactividad).

También puedes usar el blueprint `backend/render.yaml`.

---

## 4. Variables de entorno en Render

En el servicio → **Environment**:

| Variable | Valor |
|----------|--------|
| `DATABASE_URL` | Pooled string de Neon |
| `JWT_SECRET` | Clave larga y aleatoria |
| `JWT_EXPIRES_IN` | `7d` |
| `RAWG_API_KEY` | Tu API Key de [RAWG](https://rawg.io/apidocs) |
| `NODE_ENV` | `production` |

**No pongas `PORT`.** Render lo asigna solo.

Guarda y espera el deploy.

---

## 5. Sembrar géneros (una vez)

Desde tu PC, con el mismo `DATABASE_URL` de Neon en `backend/.env`:

```bash
cd "Rotten tomatoes/backend"
pnpm seed
```

---

## 6. Probar la API

```
https://TU-SERVICIO.onrender.com/api/health
```

Debe responder algo como:

```json
{ "status": "ok", "db": "connected", "rawg": "configured" }
```

---

## 7. Conectar la app Ionic al backend en Render

Edita `frontend/src/environments/environment.prod.ts`:

```ts
export const environment = {
  production: true,
  apiUrl: 'https://TU-SERVICIO.onrender.com/api',
};
```

Para probar en el navegador contra Render también puedes poner esa URL
en `environment.ts`.

Luego genera el APK (ver `frontend/README.md`):

```bash
cd "Rotten tomatoes/frontend"
pnpm android:apk
# o: pnpm android:open  → Android Studio → Build APK
```

---

## Local vs producción

| Modo | Backend | `apiUrl` |
|------|---------|----------|
| Local / teléfono en WiFi | `pnpm run dev` (puerto 4001) | `http://TU_IP:4001/api` |
| Producción / APK | Render | `https://….onrender.com/api` |

Para demostrar la app en clase o desde cualquier red, usa siempre la URL de Render.

---

## Errores frecuentes

| Problema | Solución |
|----------|----------|
| Build falla en `pnpm` / `corepack` / `EROFS` | No uses `corepack enable`. Build: `npm install --include=dev && npm run build` |
| `Can't reach database` | Revisa `DATABASE_URL` (Pooled + `sslmode=require`) |
| `rawg: missing` | Falta `RAWG_API_KEY` en Environment |
| Primer request lento | Plan Free: el servicio se duerme; espera ~30–60 s |
| Network Error en el teléfono | Estás apuntando a `localhost` o IP local; usa `onrender.com` |
| Géneros vacíos | Corre `pnpm seed` contra Neon |
