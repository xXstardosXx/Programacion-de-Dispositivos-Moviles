# QuestScore — Reseñas de videojuegos (estilo Rotten Tomatoes / Questlog)

App móvil para reseñar **videojuegos** con doble puntuación (Audience Score vs Critic Score), integración con **RAWG** (gratis) y caché en **Neon (PostgreSQL)**.

```
Rotten tomatoes/
├── backend/     → API REST (Express + Prisma + Neon + RAWG)
└── frontend/    → app móvil (Ionic + Angular + Capacitor)
```

---

## Respuestas rápidas

| Pregunta | Respuesta |
|----------|-----------|
| ¿Se usa Neon? | **Sí.** PostgreSQL serverless para usuarios, juegos cacheados, géneros y reseñas. |
| ¿Hay que guardar imágenes? | **No.** Solo se guarda la **URL** de la portada (CDN de RAWG). La app las carga por internet. |
| ¿TMDB? | **No.** Se reemplazó por **RAWG** (API gratis de videojuegos, sin dominio ni pago). |
| ¿Contenido +21 / sexual? | **Bloqueado.** Filtro estricto por ESRB Adults Only + tags/palabras NSFW. |

---

## Stack

| Capa | Tecnología |
|------|------------|
| Base de datos | Neon (PostgreSQL) |
| ORM | Prisma |
| Backend | Node + Express + TypeScript |
| App | Ionic 8 + Angular 20 + Capacitor |
| API externa | [RAWG](https://rawg.io/apidocs) (gratis) |
| Deploy | Render (API) + Neon (DB) |

---

## 1) Neon

1. Crea proyecto en [neon.tech](https://neon.tech).
2. Copia la **Pooled connection string** (`...?sslmode=require`).
3. Ponla en `backend/.env` como `DATABASE_URL`.

---

## 2) RAWG (gratis, sin dominio)

1. Entra a [rawg.io/apidocs](https://rawg.io/apidocs) → crea cuenta → **Get API Key**.
2. Ponla en `backend/.env` como `RAWG_API_KEY`.

No pide suscripción de pago ni dominio (a diferencia de Steam / otras APIs).

---

## 3) Backend

```bash
cd backend
pnpm install
copy .env.example .env   # Windows
```

```env
PORT=4001
DATABASE_URL=postgresql://...neon.tech/...?sslmode=require
JWT_SECRET=una_clave_larga
JWT_EXPIRES_IN=7d
RAWG_API_KEY=tu_key_de_rawg
```

```bash
pnpm prisma:push
pnpm seed
pnpm dev
```

Health: `http://localhost:4001/api/health` → `db: connected`, `rawg: configured`.

Deploy en producción: ver `backend/RENDER.md`.

---

## 4) Frontend (Ionic)

```bash
cd frontend
pnpm install
```

Edita la URL de la API:

- Desarrollo: `src/environments/environment.ts` → `http://localhost:4001/api` (o tu IP LAN)
- Producción / APK: `src/environments/environment.prod.ts` → `https://TU-SERVICIO.onrender.com/api`

```bash
pnpm serve          # navegador en http://localhost:8100
pnpm android:open   # abre Android Studio (APK)
pnpm android:apk    # APK debug por CLI (requiere Android SDK)
```

Detalle: `frontend/README.md`.

---

## Filtro de contenido limpio

La API y el listado ocultan juegos con contenido adulto / sexual (ESRB AO y tags NSFW).
