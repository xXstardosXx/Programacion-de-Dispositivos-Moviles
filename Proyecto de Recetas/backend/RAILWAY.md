# Desplegar backend en Railway

Con Railway el backend queda en internet 24/7. La app (APK) puede usarse **sin la misma WiFi** y **sin tu PC encendida**.

MongoDB sigue en **Atlas**. Railway solo hospeda la API Node.

---

## 1. Atlas — permitir Railway

En MongoDB Atlas → **Network Access** → **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`).

Railway no tiene una IP fija; si solo whitelisteas tu casa, fallará en la nube.

---

## 2. Crear proyecto en Railway

1. Entra a [railway.app](https://railway.app) e inicia sesión (GitHub sirve).
2. **New Project** → **Deploy from GitHub repo** → elige el repo completo (no pide carpeta al conectar; es normal).
3. **Sube estos cambios a GitHub primero** (`railway.toml` y `package.json` en la raíz del repo). Sin push, Railway no los ve.

### ¿Root Directory?

**No hace falta** si ya están en GitHub los archivos de la **raíz del repo**:

- `railway.toml` → compila y arranca `Proyecto de Recetas/backend`
- `package.json` → scripts `build` y `start` apuntando al backend

Railway despliega todo el repo pero solo ejecuta el backend.

*(Opcional)* Si prefieres Root Directory: servicio → **Settings** → **Source** → `Proyecto de Recetas/backend`

4. Servicio → **Settings** → **Networking** → **Generate Domain**

---

## 3. Variables de entorno en Railway

En el servicio → **Variables**:

| Variable | Valor |
|----------|--------|
| `MONGODB_URI` | Tu URI de Atlas (`.../recetas_app?...`) |
| `JWT_SECRET` | Clave larga y secreta |
| `JWT_EXPIRES_IN` | `7d` |
| `NODE_ENV` | `production` |

No pongas `PORT`; Railway lo asigna solo.

Guarda y espera el redeploy (1–2 min).

---

## 4. Probar el backend

Abre en el navegador:

```
https://TU-DOMINIO.up.railway.app/api/health
```

Debe responder:

```json
{"status":"ok","message":"API de Recetas funcionando"}
```

---

## 5. Conectar la app móvil

La URL base es **`https://TU-DOMINIO.up.railway.app/api`** (con `https` y `/api` al final).

### Expo Go (desarrollo)

`frontend/.env`:

```env
EXPO_PUBLIC_API_URL=https://TU-DOMINIO.up.railway.app/api
```

Reinicia Expo (`pnpm start`).

### APK

Edita `frontend/eas.json` → perfil **`production`**:

```json
"env": {
  "EXPO_PUBLIC_API_URL": "https://TU-DOMINIO.up.railway.app/api"
}
```

Genera APK:

```powershell
cd frontend
pnpm build:apk:prod
```

Desinstala el APK viejo e instala el nuevo.

Con HTTPS **no hace falta** misma WiFi ni PC encendida; solo internet en el teléfono.

---

## Desarrollo local vs Railway

| Modo | URL en la app | ¿PC encendida? | ¿Misma WiFi? |
|------|---------------|----------------|--------------|
| Local | `http://192.168.x.x:3000/api` | Sí | Sí |
| Railway | `https://xxx.up.railway.app/api` | No | No |

Perfil EAS **`preview`** = IP local. Perfil **`production`** = Railway.

---

## Errores frecuentes

| Problema | Solución |
|----------|----------|
| Build falla en Railway | Haz **push** a GitHub con `railway.toml` en la raíz; revisa Deploy Logs |
| `bad auth` MongoDB | URI mal o Atlas sin `0.0.0.0/0` |
| Network Error en APK | URL vieja en `eas.json`; rebuild con perfil `production` |
| 502 / app caída | Revisa **Deploy Logs** en Railway |

---

## Archivos del repo

- **`/railway.toml`** (raíz del repo) — apunta al backend
- **`/package.json`** (raíz) — scripts build/start para Railway
- `Proyecto de Recetas/backend/` — código de la API
