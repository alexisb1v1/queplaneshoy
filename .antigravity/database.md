# Arquitectura de Datos y Modelos Frontend - "Qué planes hoy"

Este documento define la estructura de datos, modelos de dominio, DTOs de transferencia y almacenamiento en cliente (`localStorage`) utilizados en la aplicación web frontend (**Next.js** con Clean Architecture).

> 💡 **Documentación complementaria:** Para consultar los flujos de navegación, casos de uso y diagramas de interacción, consulta [workflows.md](file:///d:/Personal/queplaneshoy/.antigravity/workflows.md).

---

## 1. Modelos de Dominio (Domain Models)

El frontend utiliza modelos de dominio desacoplados de la estructura cruda de la API mediante mappers dedicados (`eventDtoToModel`, etc.).

### 1.1 `EventModel`
Representa la entidad de un evento en la interfaz de usuario:
* **`id`** (`string`): ID del evento.
* **`publicUuid`** (`string`): Identificador público UUID.
* **`title`** (`string`): Título comercial del espectáculo.
* **`slug`** (`string`): URL amigable única para SEO y Landing Page.
* **`description`** (`string`): Descripción o sinopsis.
* **`category`** (`string`): Categoría (`CONCERTS`, `THEATER`, `SPORTS`, `FESTIVALS`, `COMEDY`, `GASTRONOMY`).
* **`tags`** (`string[]`): Etiquetas de búsqueda.
* **`venue`** (`string`): Nombre comercial del recinto o local.
* **`address`** (`string`): Dirección física.
* **`ubigeoCode`** (`string`): Código INEI del distrito.
* **`date`** (`string`): Fecha y hora de inicio de la primera función.
* **`price`** (`number`): Precio base de referencia en Soles.
* **`bannerUrl`** (`string`): Imagen de portada alojada en Cloudflare R2.
* **`hasLandingPage`** (`boolean`): Bandera de landing page exclusiva.
* **`landingConfig`** (`LandingConfigData`): Configuración visual del landing.
* **`status`** (`string`): `draft`, `published`, `paused`, `cancelled`.

### 1.2 `UserModel`
Ficha del usuario autenticado y perfil comercial de productor:
* **`id`** (`string`): ID del usuario.
* **`email`** (`string`): Correo electrónico principal.
* **`name`** (`string`): Nombre completo.
* **`role`** (`string`): `customer` o `admin`.
* **`isOrganizer`** (`boolean`): Indica si el perfil de promotor está activo.
* **`organizerName`** (`string`): Razón social o nombre comercial de la productora.
* **`organizerDocumentType`** (`string`): `DNI`, `RUC`, `CE`.
* **`organizerDocumentNumber`** (`string`): Número de documento fiscal.
* **`organizerPhone`** (`string`): Teléfono o WhatsApp comercial.
* **`organizerLogoUrl`** (`string`): Logotipo de la productora en R2.
* **`emailVerifiedAt`** (`string | null`): Fecha de verificación (obligatoria para publicar según Plan B).

### 1.3 `SearchEventItem` (Búsqueda Instantánea con Meilisearch)
Ficha ligera consumida en milisegundos por los buscadores interactivos:
* **`id`** (`string`): Clave primaria.
* **`publicUuid`** (`string`): UUID público.
* **`title`** (`string`): Título del evento.
* **`slug`** (`string`): URL amigable.
* **`category`** (`string`): Categoría.
* **`venue`** (`string`): Recinto o local.
* **`ubigeoCode`** (`string`): Código distrital INEI de 6 dígitos.
* **`city`** (`string`): Nombre de la ciudad resuelta por ubigeo.
* **`departmentCode`** (`string`): Código departamental de 2 dígitos.
* **`minPrice`** (`number`): Precio mínimo calculado.
* **`date`** (`string`): Fecha del show.
* **`bannerUrl`** (`string`): Miniatura de portada R2.
* **`hasLandingPage`** (`boolean`): Si cuenta con landing dedicada.
* **`isFeatured`** (`boolean`): Si fue marcado como destacado editorial.

### 1.4 `PublishedCity` (Ciudades con Eventos Activos)
Listado dinámico devuelto por `GET /search/cities`:
* **`id`** (`string`): Identificador en mayúsculas (ej: `LIMA`, `PUCALLPA`).
* **`name`** (`string`): Nombre oficial de la ciudad (ej: `Lima`, `Pucallpa`).
* **`departmentCode`** (`string`): Código INEI del departamento (ej: `15`, `25`).
* **`eventCount`** (`number`): Cantidad de eventos en estado `published` en dicha ciudad.

---

## 2. Parámetros de Creación de Eventos (`CreateEventParams`)

Estructura consolidada enviada en `POST /events`:
* **Datos Básicos:** `title`, `slug`, `description`, `category`, `tags`, `ageRestriction`, `userTicketLimit`.
* **Productora:** `organizerName`, `organizerDocumentType`, `organizerDocumentNumber`, `organizerPhone`, `organizerLogoUrl`.
* **Ubicación:** `venue`, `location`, `address`, `addressReference`, `ubigeoCode`, `coordinates`, `googleMapsUrl`.
* **Reglas de Acceso:** `entryRequirements`, `openingHoursComment`, `termsAndConditionsUrl`, `faqs`.
* **Multimedia:** `bannerUrl`, `images` (`banner`, `gallery`, `zone_map`).
* **Sub-agregados:**
  * `shows`: `[{ name, startTime, salesEndAt, durationHours }]`
  * `zones`: `[{ name, title, color, capacity, regularPrice, serviceFee, benefits, tiers: [{ tierNumber, name, price, capacity, endAt }] }]`
  * `coupons`: `[{ code, discountType, discountValue, usageType, maxUses, expiresAt }]`
  * `landingConfig`: `{ header, body, footer, theme, slug }`

---

## 3. Almacenamiento Local en Cliente (`localStorage`)

| Clave | Formato | Propósito | Duración |
| :--- | :--- | :--- | :--- |
| **`qph_token`** | `String` (JWT) | Token de acceso de sesión de API | Sesión / Hasta logout |
| **`qph_user`** | `JSON` (`UserModel`) | Cache ligera de datos para el Navbar y saludo | Sincronizada en login |
| **`qph_event_draft`** | `JSON` | Respaldo temporal si el usuario pierde sesión al crear un evento | Hasta publicación |

