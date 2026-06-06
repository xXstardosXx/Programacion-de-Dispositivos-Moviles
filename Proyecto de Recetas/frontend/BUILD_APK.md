# Checklist antes de generar el APK

Corre esto **antes** de `pnpm build:apk` para no perder 20 minutos en un build roto.

## 1. Validaciones automáticas (en `frontend/`)

```powershell
pnpm dlx expo-doctor
pnpm exec tsc --noEmit
```

Debe salir **18/18 checks passed** y sin errores de TypeScript.

## 2. Iconos (`assets/`)

| Archivo | Debe ser |
|---------|----------|
| `icon.png` | 1024×1024, ~900 KB (no ~4 KB en blanco) |
| `adaptive-icon.png` | Igual, cuadrado |
| `splash-icon.png` | Cuadrado |

Si el icono instalado se ve **blanco**, los PNG estaban corruptos → regenerar assets y rebuild.

## 3. URL del backend en `eas.json`

**Backend local** (perfil `preview`, comando `pnpm build:apk`):

```json
"EXPO_PUBLIC_API_URL": "http://TU_IP:3000/api"
```

**Backend en Railway** (perfil `production`, comando `pnpm build:apk:prod`):

```json
"EXPO_PUBLIC_API_URL": "https://tu-backend.up.railway.app/api"
```

- La URL **queda dentro del APK**; cambiar `.env` no alcanza
- Con Railway no hace falta misma WiFi ni PC encendida
- Guía Railway: `backend/RAILWAY.md`

## 4. HTTP permitido en Android

Configurado con `expo-build-properties` → `usesCleartextTraffic: true`  
(sin esto el APK da **Network Error** con `http://`)

## 5. Probar backend desde el teléfono (sin APK)

1. `pnpm dev` en `backend/`
2. Teléfono y PC en la **misma WiFi**
3. Chrome en el teléfono: `http://TU_IP:3000/api/health`

Si esto **no** carga, el APK tampoco funcionará (firewall, IP mal, backend apagado).

## 6. MongoDB Atlas

Network Access → IP de la red donde presentes.

## 7. Generar e instalar

```powershell
pnpm build:apk          # backend local (preview)
pnpm build:apk:prod     # backend Railway (production)
```

- Desinstala el APK viejo antes de instalar el nuevo
- Tras instalar, abre la app con el backend **ya corriendo**

---

## Resumen de fixes comunes

| Síntoma | Causa | Fix |
|---------|-------|-----|
| Network Error | HTTP bloqueado o IP mal | `expo-build-properties` + IP en `eas.json` + rebuild |
| Icono blanco | PNG corrupto (~4 KB) | Assets nuevos + rebuild |
| expo doctor falla | deps o iconos | `expo install expo-font`, iconos 1024×1024 |
