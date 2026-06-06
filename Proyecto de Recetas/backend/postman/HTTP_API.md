# Documentación HTTP — API Recetas

**Base URL:** `http://localhost:3000/api`

---

## Autenticación

La mayoría de endpoints protegidos requieren:

```
Authorization: Bearer <token>
```

El token se obtiene al registrar o iniciar sesión.

---

## Auth

### POST `/auth/register`

Registra un nuevo usuario.

**Body (JSON):**
```json
{
  "name": "María García",
  "email": "maria@ejemplo.com",
  "password": "123456"
}
```

**Respuestas:**
- `201` — Usuario creado + token
- `409` — Email ya registrado
- `400` — Datos inválidos

---

### POST `/auth/login`

**Body (JSON):**
```json
{
  "email": "maria@ejemplo.com",
  "password": "123456"
}
```

**Respuestas:**
- `200` — Token + datos del usuario
- `401` — Credenciales inválidas

---

### GET `/auth/profile` [auth]

Retorna el perfil del usuario autenticado.

---

### PUT `/auth/profile` [auth]

Actualiza nombre, email y/o contraseña.

**Body (JSON):**
```json
{
  "name": "María G.",
  "email": "maria.nueva@ejemplo.com",
  "password": "nuevaClave123"
}
```

---

### DELETE `/auth/profile` [auth]

Elimina la cuenta y todos sus grupos y recetas.

---

## Grupos

### GET `/groups` [auth]

Lista los grupos del usuario autenticado.

---

### GET `/groups/:id` [auth]

Obtiene un grupo y sus recetas asociadas (ordenadas alfabéticamente).

---

### POST `/groups` [auth]

**Body (JSON):**
```json
{
  "name": "Desayunos",
  "description": "Recetas para la mañana",
  "color": "#F4A261"
}
```

---

### PUT `/groups/:id` [auth]

Actualiza nombre, descripción o color.

---

### DELETE `/groups/:id` [auth]

Elimina el grupo y **todas las recetas** que pertenezcan a él.

**Respuesta ejemplo:**
```json
{
  "message": "Grupo eliminado",
  "deletedRecipesCount": 3,
  "warning": "Se eliminaron 3 receta(s) asociada(s) a este grupo"
}
```

---

### DELETE `/groups/:groupId/recipes/:recipeId` [auth]

Quita la receta del grupo sin eliminarla de la aplicación.

---

## Recetas

### GET `/recipes`

Lista **todas** las recetas del sistema (público). Orden: alfabético por título.

---

### GET `/recipes/mine` [auth]

Lista solo las recetas creadas por el usuario autenticado.

---

### GET `/recipes/:id`

Detalle de una receta (con grupos y autor poblados).

---

### POST `/recipes` [auth]

**Body (JSON):**
```json
{
  "title": "Avena con frutas",
  "image": "data:image/jpeg;base64,...",
  "ingredients": ["1 taza de avena", "1 plátano"],
  "steps": ["Cocinar avena", "Agregar frutas"],
  "groupIds": ["64abc123...", "64def456..."]
}
```

`groupIds` es un array — relación **muchos a muchos**.

---

### PUT `/recipes/:id` [auth]

Actualiza una receta (solo el autor).

---

### DELETE `/recipes/:id` [auth]

Elimina una receta (solo el autor).

---

## Health

### GET `/health`

```json
{ "status": "ok", "message": "API de Recetas funcionando" }
```
