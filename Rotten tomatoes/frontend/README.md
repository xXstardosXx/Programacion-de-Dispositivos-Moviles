# QuestScore — Frontend (Ionic + Angular)

App móvil de reseñas de videojuegos (estilo Metacritic / Rotten Tomatoes) con
puntuación separada de **Audiencia** y **Críticos**. Migrada de Expo/React Native
a **Ionic 8 + Angular 20** (componentes standalone), consumiendo el backend
Express + Prisma + Neon + RAWG que está en `../backend`.

Usa **pnpm** (no npm).

## Requisitos

- Node 18+ (probado con Node 22)
- pnpm 9 (`corepack enable` o `npm i -g pnpm`)
- Ionic CLI (opcional): `pnpm add -g @ionic/cli`
- Para el APK: Android Studio + JDK 17 (lo instala Android Studio)

## 1. Instalar dependencias

```bash
cd frontend
pnpm install
```

## 2. Configurar la URL del backend

Edita la URL de la API según dónde corra tu backend:

- Desarrollo (navegador): `src/environments/environment.ts` → `apiUrl`
  - PC local: `http://localhost:4001/api`
- Producción / APK: `src/environments/environment.prod.ts` → `apiUrl`
  - Backend en Render: `https://TU-SERVICIO.onrender.com/api`

> El token JWT se guarda en `localStorage` (funciona en navegador y en el WebView de Android).

## 3. Correr en el navegador (desarrollo)

```bash
pnpm serve        # o: ionic serve
```

Abre `http://localhost:8100`.

## 4. Compilar la web

```bash
pnpm build        # genera la carpeta www/
```

## 5. Generar el APK de Android (Capacitor)

La plataforma Android ya está creada en `android/`.

Opción A — con Android Studio (recomendado para firmar / release):

```bash
pnpm android:open   # build + sync + abre Android Studio
```

En Android Studio: **Build > Build Bundle(s) / APK(s) > Build APK(s)**.

Opción B — APK de debug por línea de comandos:

```bash
pnpm android:apk
```

El APK queda en:
`android/app/build/outputs/apk/debug/app-debug.apk`

> Para el APK usa una `apiUrl` accesible desde el teléfono. Lo más simple es
> apuntar a tu backend en **Render (https)**. Si apuntas a un backend local por
> `http`, Android bloquea el tráfico en claro por defecto.

## Estructura

```
src/app/
  core/         Servicios (Api, Auth, Game, Toast), guards, modelos, utils
  shared/       Componentes reutilizables (game-card, score-badge, etc.)
  pages/        Pantallas (login, register, tabs, explore, my-reviews, profile, game-detail)
  app.routes.ts Rutas con guards de auth
src/theme/variables.scss   Paleta (tema oscuro, rojo tomate)
```
