# Colecciones + Tracker de Lectura — Documento de Diseño

**Fecha:** 2026-02-20
**Proyecto:** TFM Master Desarrollo de Software potenciado por IA
**Rama:** `analisis-funcionalidad`

---

## Resumen

Transformar la app de un buscador de cómics a un **gestor personal de lectura y colección**. El usuario puede crear colecciones con nombre, añadir issues a ellas, marcar su estado de lectura (por leer, leyendo, leído) y si los posee físicamente o digitalmente. Cada colección muestra progreso visual de lectura.

Esta funcionalidad reemplaza y extiende el sistema de favoritos actual (que es una lista plana) con un modelo más rico y organizado.

---

## Funcionalidades

### 1. Colecciones

- El usuario crea colecciones con **nombre** y **descripción opcional** (ej: "Saga de Batman", "Marvel Must-Read")
- Puede **renombrar** y **eliminar** colecciones
- Ve un listado de todas sus colecciones en `/collections`
- Cada colección muestra: nombre, nº de issues, barra de progreso de lectura, portadas en miniatura

### 2. Gestión de issues en colecciones

- Desde la ficha del issue (`/issue/[id]`), el usuario puede **añadir el issue a una o varias colecciones**
- Desde la vista de colección, puede **eliminar issues** de ella
- Los datos del issue se cachean en Supabase al añadirlo (igual que favoritos actuales): `issue_id`, `issue_title`, `issue_thumbnail`

### 3. Tracker de lectura y posesión

- Cada issue en una colección tiene un **estado de lectura**: `pending` | `reading` | `read`
- Cada issue tiene un **estado de posesión**: `owned` (boolean) para saber si lo tiene comprado/descargado.
- El usuario cambia el estado desde la vista de colección con un click/toggle
- Cada colección muestra un **indicador de progreso**: "4 de 12 leídos" + barra visual

### 4. Migración de favoritos

- Los favoritos existentes se migran automáticamente a una colección especial llamada "Favoritos" (o equivalente i18n)
- Se mantiene retrocompatibilidad: la tabla `favorites` existente no se elimina, se añaden las nuevas tablas

---

## Modelo de Datos (Supabase)

### `collections` (nueva)

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | uuid PK | Generado automáticamente |
| `user_id` | uuid FK → auth.users | Propietario |
| `name` | text NOT NULL | Nombre de la colección (max 100 chars) |
| `description` | text | Descripción opcional |
| `created_at` | timestamptz | Fecha de creación |
| `updated_at` | timestamptz | Última modificación |

**RLS:** cada usuario solo ve/modifica sus propias colecciones.

**Constraint:** `UNIQUE(user_id, name)` — un usuario no puede tener dos colecciones con el mismo nombre.

### `collection_items` (nueva)

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | uuid PK | Generado automáticamente |
| `collection_id` | uuid FK → collections | Colección padre |
| `issue_id` | integer NOT NULL | ID del issue en Comic Vine |
| `issue_title` | text | Título cacheado |
| `issue_thumbnail` | text | URL de portada cacheada |
| `reading_status` | text NOT NULL DEFAULT 'pending' | `pending` / `reading` / `read` |
| `owned` | boolean NOT NULL DEFAULT false | Indica si el usuario posee físicamente/digitalmente el issue |
| `added_at` | timestamptz | Fecha en que se añadió |

**RLS:** hereda del propietario de la colección padre.

**Constraint:** `UNIQUE(collection_id, issue_id)` — un issue no puede estar duplicado en la misma colección.

**Check:** `reading_status IN ('pending', 'reading', 'read')`

---

## Pantallas nuevas

### `/collections` (listado)

- Grid responsivo con tarjetas de colección
- Cada tarjeta muestra: nombre, descripción truncada, nº issues, barra progreso, 3 portadas en miniatura
- Botón "Nueva colección" abre modal/formulario inline
- Requiere login (protegido por middleware)

### `/collections/[id]` (detalle de colección)

- Header: nombre, descripción, botón editar/eliminar
- Barra de progreso global
- Grid de issues con portada, título, badge de estado (`pending`/`reading`/`read`) y badge/botón de posesión (`owned`)
- Click en badge cambia estado de lectura de forma cíclica
- Click en icono/badge de posesión alterna entre lo tengo / no lo tengo
- Botón para eliminar issue de la colección

### Cambios en `/issue/[id]` (existente)

- Reemplazar botón "Añadir a favoritos" por **"Añadir a colección"**
- Al pulsar, mostrar dropdown/modal con las colecciones del usuario
- Permitir seleccionar una o crear una nueva desde ahí
- Indicar visualmente si el issue ya está en alguna colección

---

## Seguridad (OWASP)

- **RLS en Supabase:** todas las tablas nuevas con Row Level Security
- **Validación server-side:** el middleware protege `/collections` igual que `/favorites`
- **Sanitización de inputs:** nombre y descripción de colección se validan en longitud y contenido
- **No exponer IDs internos:** las colecciones usan UUID, no IDs secuenciales
- **Rate limiting:** se aplica el mismo patrón que ya tiene el middleware

---

## Internacionalización

Nuevas claves i18n para `es-ES` y `en-US`:

- `collections.title`, `collections.new`, `collections.empty`, `collections.delete`, `collections.edit`
- `collections.progress` ("{{read}} de {{total}} leídos")
- `collections.addTo`, `collections.createNew`
- `readingStatus.pending`, `readingStatus.reading`, `readingStatus.read`
- `ownershipStatus.owned`, `ownershipStatus.notOwned`

---

## Impacto en la API de ComicVine

**Ninguno.** Las colecciones son 100% Supabase. Los datos del issue se cachean al añadirlo, igual que el patrón actual de favoritos.

---

## Fuera de alcance

- Colecciones públicas / compartir con otros usuarios
- Importar/exportar colecciones
- Ordenar issues dentro de una colección
- Notificaciones de nuevos issues en series seguidas
