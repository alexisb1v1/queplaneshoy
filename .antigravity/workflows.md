# Flujos de Navegación y Arquitectura Frontend - "Qué planes hoy"

Este documento describe la arquitectura de software, patrones de diseño, casos de uso y diagramas de flujo de la interfaz web en **Next.js** (App Router).

---

## 1. Arquitectura Frontend (Clean Architecture + DDD)

El frontend sigue los principios de **Clean Architecture** y manejo funcional de errores mediante la librería **`neverthrow`** (`Result` / `ResultAsync`).

```
[UI Components / Screens]
         │ (Invoca Casos de Uso)
         ▼
[Use Cases (Application)]
         │ (Interactúa mediante Contratos)
         ▼
[Repositories (Domain Interfaces)]
         │ (Implementado por)
         ▼
[Repository Implementations (Infrastructure)]
         │ (Delega llamadas HTTP)
         ▼
[ApiService / ApiClient (HTTP + Neverthrow)]
```

### Reglas de Oro Arquitectónicas:
1. **Los componentes de UI nunca consumen `fetch` ni `apiClient` directamente:** Siempre ejecutan un caso de uso (`searchEventsUseCase`, `createEventUseCase`, `publishEventUseCase`).
2. **Manejo Funcional con `neverthrow`:** Todo caso de uso retorna `ResultAsync<T, DomainError>`. La UI procesa los resultados mediante `.match((ok) => ..., (err) => ...)`, eliminando los bloques `try/catch` descontrolados.
3. **Desacoplamiento con Mappers:** Los DTOs recibidos de la API se mapean a modelos de dominio antes de ser expuestos a la interfaz visual.

---

## 2. Mapa de Rutas de la Aplicación

```mermaid
graph TD
    Home["/ (Home)"] -->|"Buscador o Menú"| Catalog["/events (Cartelera)"]
    Home -->|"Clic en Evento"| Detail["/events/:id (Detalle Canónico)"]
    Home -->|"Landing Exclusiva"| Landing["/e/:slug (Landing Dedicada)"]
    Catalog --> Detail
    Detail --> Checkout["/checkout/:token (Selección de Entradas)"]
    Checkout --> Success["/checkout/success (Entradas con QR)"]
    
    Home -->|"Acceso Promotor"| OrgEvents["/organizer/events (Mis Eventos)"]
    OrgEvents --> NewEvent["/organizer/events/new (Creación de Eventos)"]
    Home --> Profile["/profile/settings (Ajustes & Productora)"]
    Profile --> MyTickets["/profile/tickets (Mi Billetera)"]
```

---

## 3. Flujo de Creación y Publicación de Eventos (`/organizer/events/new`)

Workspace **Full-Height y Full-Width** ubicado fuera del route group `(main)` (`src/app/organizer/events/new/page.tsx`) para operar en pantalla completa sin cabecera de tienda ni footer público. Está diseñado con navegación por **6 fases progresivas** (4 pasos esenciales para vender: *Ficha y Ubicación*, *Multimedia & Portada*, *Fechas y Shows*, *Zonas y Tarifas*; y 2 opcionales: *Landing Dedicada*, *Cupones & FAQs*), modal de vista previa en vivo, blindaje contra duplicados y validación de correo verificado (**Plan B**).

### 3.1 Regreso Dinámico según Origen (`?from=`)
* **Desde Mis Eventos (`/organizer/events`, Sidebar Promotor):** enlaza a `/organizer/events/new?from=events` y habilita el botón *"Volver a Mis Eventos"* en cabecera.
* **Desde Perfil (`/profile/settings`):** enlaza a `/organizer/events/new?from=profile` y habilita *"Volver a Mi Perfil"*.
* **Desde Cabecera Global / Home (`/`):** enlaza a `/organizer/events/new?from=home` (o fallback vía `document.referrer`) y habilita *"Volver al Inicio"*.

### 3.2 Diagrama de Secuencia de Publicación

```mermaid
sequenceDiagram
    autonumber
    actor Org as Organizador
    participant Screen as CreateEventScreen
    participant UseCase as createEventUseCase / publishEventUseCase
    participant API as Backend NestJS
    participant DB as PostgreSQL
    participant Meili as Meilisearch

    Org->>Screen: Completa Fases 1..4 (+ opcionales 5..6) y Clic en "Publicar Evento"
    Screen->>Screen: Valida campos esenciales y redirige a la fase faltante si aplica
    Screen->>Screen: Activa isProcessing = true (Full-Screen Overlay + Bloqueo de botones)

    alt Evento aún no creado
        Screen->>UseCase: createEventUseCase.execute(payload)
        UseCase->>API: POST /api/events
        API->>DB: INSERT INTO events (status='draft')
        API-->>UseCase: Evento Creado (id=123)
        UseCase-->>Screen: createdEventId = 123
    end

    alt Usuario tiene email verificado (emailVerifiedAt != null)
        Screen->>UseCase: publishEventUseCase.execute(123)
        UseCase->>API: POST /api/events/123/publish
        API->>DB: UPDATE events SET status='published'
        API->>Meili: Indexa el evento para búsqueda instantánea
        API-->>UseCase: 200 OK
        UseCase-->>Screen: Toast de Éxito + Redirección según origen
    else Usuario NO verificado
        Screen->>Screen: Muestra Modal "Verifica tu Correo" (Plan B)
        Note over Screen: El borrador queda seguro en BD y no se duplica
    end
```

### 3.3 Blindaje Antidoble-sumisión, Escala de Comisión Oficial y Aprobación
* **`isProcessing = isSaving || isPublishing`:** Deshabilita visual y funcionalmente los botones de "Guardar Borrador" y "Publicar Evento" (cabecera y barra inferior sticky).
* **Full-Screen Loading Overlay:** Capa opaca con *backdrop-blur* y spinner que bloquea todo clic del puntero mientras se procesa la solicitud.
* **Productora Compacta:** Si `currentUser` ya posee `organizerName` y `organizerDocumentNumber`, la Fase 1 muestra una tarjeta resumen colapsable para agilizar la carga.
* **Multimedia, Video y Redes (Fase 2):** Además de banner, croquis y galería (máx. 4), centraliza la URL del video promocional (`promoVideoUrl` para YouTube/Vimeo/MP4) y las redes sociales del evento (`socialLinks`), sincronizándose automáticamente con la Landing Dedicada.
* **Escala Oficial de Comisiones QuePlanesHoy (`calculateQphFee`):**
  - **Hasta S/ 50.00:** S/ 6.00 por entrada.
  - **De S/ 51.00 a S/ 125.00:** S/ 10.00 por entrada.
  - **A partir de S/ 126.00:** 8% del precio por entrada.
  - **Modal Informativo de Tarifario:** Accesible desde la barra y el drawer con explicación visual de la escala y del cálculo de la Tarifa Final.
  - **Campo "Tarifa Final":** Muestra en tiempo real el precio final al comprador según el switch de inclusión de comisión.
  - **Ocultamiento del Input en Creación:** El promotor no edita la comisión; solo define aforo, precio regular y si incluye comisión.
* **Modal de Etapa de Aprobación & Liquidación:** Al hacer clic en "Publicar Evento", se abre un modal de aprobación donde se desglosan oficialmente las zonas, el precio al comprador, la comisión oficial calculada y la recaudación neta estimada que recibirá el promotor antes de dar el pase a producción.
* **Comisión Incluida vs Sumada (`ZonesManager`):** Cada zona permite activar `feeIncluded`. Si está activo, el precio ingresado incluye la comisión QPH y esta se descuenta del neto del promotor; si está desactivado, la comisión se suma al precio final que paga el comprador.
* **Vigencia Opcional en Cupones (`CouponsManager`):** La fecha y hora límite se oculta tras un switch opcional para mantener limpio el formulario.
* **Menú de Gestión de Promotor (`OrganizerSidebar`):** La opción general de "Cupones y Promos" fue eliminada del sidebar principal, ya que los cupones y promociones se gestionan exclusivamente por cada evento.
* **Idempotencia:** Si ya existe `createdEventId`, `handlePublish` no vuelve a crear el evento; procede directamente a su activación.

---

## 4. Flujo de Búsqueda Instantánea con Meilisearch

Integrado en [`desktop-header.tsx`](file:///d:/Personal/queplaneshoy/src/app/common/components/desktop-header.tsx) y en [`search-bar.tsx`](file:///d:/Personal/queplaneshoy/src/app/features/events/ui/components/search-bar.tsx).

```mermaid
sequenceDiagram
    autonumber
    actor Usuario as Usuario Final
    participant Dropdown as SearchInstantDropdown
    participant UseCase as searchEventsUseCase
    participant API as Backend NestJS
    participant Meili as Meilisearch (:7700)

    Usuario->>Dropdown: Escribe "rock" en el buscador
    Dropdown->>Dropdown: Espera Debounce (220 ms)
    Dropdown->>UseCase: searchEventsUseCase.execute({ q: 'rock', limit: 6 })
    UseCase->>API: GET /api/v1/search/events?q=rock&limit=6
    API->>Meili: POST /indexes/events/search { q: 'rock' }
    Meili-->>API: Hits rankeados en < 20 ms
    API-->>UseCase: 200 OK con DTOs de búsqueda
    UseCase-->>Dropdown: SearchEventsResponse
    Dropdown-->>Usuario: Muestra Dropdown Flotante con miniaturas, recintos y precios
    Usuario->>Dropdown: Clic en resultado
    Dropdown->>Usuario: Navega directamente a /events/:id o /e/:slug
```

---

## 5. Resumen de Estados de la UI

| Componente | Estado React | Comportamiento en Pantalla |
| :--- | :--- | :--- |
| **`CreateEventScreen`** | `isProcessing` | Activa Overlay oscuro no interactivo y deshabilita botones arriba y abajo. |
| **`CreateEventScreen`** | `showVerifyModal` | Se despliega si el organizador intenta publicar sin correo confirmado. |
| **`SearchInstantDropdown`** | `isOpen && results.length > 0` | Despliega lista flotante de tarjetas con foto R2, fecha y precio mínimo. |
| **`SearchInstantDropdown`** | `isLoading` | Muestra spinner circular en el extremo derecho del input. |
| **`SearchBar / ExplorePage`** | `publishedCities` | Al montar, consulta `getPublishedCitiesUseCase` y renderiza en el `<select>` solo las ciudades con eventos en estado `published` (`name (count)`). Evita mostrar departamentos sin eventos. |
| **`DesktopHeader`** | `shouldShowSearch` | En la Home en reposo, el centro del header permanece despejado para destacar el Hero. Al scrollear (o en páginas internas), activa la barra flotante `SearchInstantDropdown` con fade-in. |
| **`HeroCarousel`** | `slides` | Consume `getFeaturedEventsUseCase` con estrategia híbrida (máx 5 eventos). Enlaza dinámicamente a `/e/:slug` si tiene landing o `/events/:id` si es ficha regular. Si no hay destacados, realiza fallback dinámico a `getUpcomingEventsUseCase`. |
| **`LandingConfigManager`** | `hasLanding = true` | Inicializa automáticamente el slug amigable a partir del título del evento. |
| **`HomePage`** | `isLoadingUpcoming, isLoadingWeekly, isLoadingWeekend` | Controla de manera independiente los esqueletos (*Skeleton Loaders / Shimmers*) animados para cada sección de eventos. Si no hay eventos disponibles en base de datos, presenta un *Empty State* amigable sin romper la cuadrícula. |

---

## 6. Cartelera Dinámica del Home (`/`) sin Mocks

Toda la portada principal se encuentra 100% desvinculada de datos estáticos y sincronizada con el backend (PostgreSQL + Redis):

1. **`HeroCarousel`**:
   - `getFeaturedEventsUseCase`: Consulta hasta 5 eventos con `is_featured = true`.
   - **Fallback Dinámico**: Si ningún evento está marcado como destacado, toma automáticamente los primeros 3 eventos publicados desde `getUpcomingEventsUseCase`.
   - **Contingencia Institucional**: Si no existen eventos publicados en la base de datos, presenta el slide de bienvenida oficial de *Qué Planes Hoy* con enlace a `/events`.
2. **`Eventos Próximos`**:
   - Consume `getUpcomingEventsUseCase` ordenados cronológicamente a partir de las funciones más cercanas.
   - Renderiza esqueletos animados mientras espera la respuesta.
3. **`Eventos Destacados de la Semana`**:
   - Consume `getWeeklyFeaturedEventsUseCase` con selección editorial y eventos de alta demanda.
4. **`Planes para Este Fin de Semana`**:
   - Consume `getWeekendEventsUseCase` para eventos programados en el fin de semana próximo.
5. **Vista Móvil**:
   - El carrusel de destacados y la lista de próximos eventos se alimentan en tiempo real de los mismos datos vivos con filtrado reactivo por categorías oficiales.

---

## 7. Vinculación de Sesión Activa al Checkout y Emisión de Entradas

Para garantizar la integridad y titularidad de las compras:
1. **Frontend (`PurchaseFlowPage`)**:
   - Sincroniza el usuario autenticado activo desde `localStorage.getItem('qph_user')` y `getCurrentUserUseCase`.
   - En el Paso 2 de pago, muestra el bloque de titularidad con nombre y correo del comprador.
   - Envía el token JWT en el encabezado `Authorization: Bearer <token>` a través de `apiClient` junto a `customerEmail` y `customerName` del usuario logueado.
2. **Backend (`OrdersController` + `SimulateOrderCheckoutHandler`)**:
   - Extrae y valida criptográficamente el JWT mediante `TokenService` resolviendo el `id` interno del usuario en sesión.
   - Asocia directamente la orden en la tabla `orders` y los tickets emitidos en `tickets` al `userId` del comprador autenticado existente en PostgreSQL, sin crear cuentas duplicadas.

---

## 8. Sistema de Cupones de Descuento en Checkout (Stitch Design & Doble Check Atómico)

Integra la experiencia visual interactiva de Stitch con validación robusta de 6 casos de negocio y candado pesimista:

1. **Matriz de Casos de Negocio:**
   - **3 Ciclos de Vida / Vigencia:**
     - `single_use`: De un solo uso; al pagarse se quema e invalida (`is_active = false`, `used_count = 1`).
     - `reusable`: Reutilizable N veces; incrementa `used_count` hasta alcanzar `max_uses`, momento en el que se auto-invalida.
     - Vigencia por fecha y hora: Válido únicamente en el rango `starts_at <= NOW() <= expires_at`.
   - **2 Tipos de Beneficio Financiero:**
     - `percentage`: Porcentaje de descuento sobre el subtotal (`subtotal * (discountValue / 100)`).
     - `fixed`: Monto fijo directo en soles (`min(subtotal, discountValue)` con piso cero).
   - **Restricción de Monto Mínimo:** `min_order_amount <= subtotal`.

2. **Doble Validación (Paso 1/2 y Checkout Atómico):**
   - **Paso 1 y 2 (UI Reactiva):** El usuario ingresa el cupón en el resumen lateral; el frontend llama a `validateCouponUseCase.execute({ eventId, code, subtotal })`. Si es exitoso, la interfaz dibuja la pastilla verde con badge de descuento, recalcula dinámicamente el total ante cualquier cambio de entradas y ofrece botón de remoción.
   - **Paso 2 Final (Doble Check Atómico en Transacción):** Al pulsar "Confirmar y Pagar", se envía `couponCode` en el payload de `simulateCheckoutUseCase`. El backend ejecuta un bloqueo pesimista `SELECT ... FOR UPDATE` sobre la fila del cupón en PostgreSQL. Si otra compra concurrente consumió el último canje al mismo instante o el cupón expiró, la transacción hace rollback de inmediato con error `COUPON_INVALID_OR_EXPIRED`, evitando cualquier cobro indebido y alertando al usuario en pantalla para que continúe sin el cupón.

---

## 9. Pasarela de Pagos (Culqi Multipago)

La pasarela activa utiliza **Culqi Checkout v4 / Orders API** (soporte para tarjetas, Yape y billeteras) con confirmación idempotente vía webhook y polling seguro (`prepareCulqiCheckoutUseCase`, `confirmCulqiChargeUseCase`, `getCulqiOrderStatusUseCase`).

---

## 10. Panel del Organizador: Mis Eventos (`/organizer/events`)

Implementado siguiendo Clean Architecture en [`OrganizerEventsScreen`](file:///d:/Personal/queplaneshoy/src/app/features/events/ui/organizer-events-screen.tsx) + [`OrganizerSidebar`](file:///d:/Personal/queplaneshoy/src/app/features/events/ui/components/organizer-sidebar.tsx) consumiendo `getOrganizerEventsUseCase` (`GET /api/events/organizer`):

* **Visibilidad en Perfil:** El enlace *"Mis eventos"* en [`ProfileLayout`](file:///d:/Personal/queplaneshoy/src/app/(main)/profile/layout.tsx) y [`SettingsTab`](file:///d:/Personal/queplaneshoy/src/app/features/profile/ui/settings-tab.tsx) se muestra únicamente cuando `user.isOrganizer === true`. Si un comprador entra a `/organizer/events`, visualiza la guía de activación comercial hacia `/organizer/events/new`.
* **Menú Gestión de Promotor:** Incluye *Crear Evento* (`/organizer/events/new`), *Mis Eventos Creados*, *Analítica y Ventas* (en preparación), *Adelanto de Liquidación*, *Liquidación del Evento* y *Configuración de Pagos* (en preparación). Se omite *"Cupones y Promos"* del menú global porque los cupones se administran por evento.
* **Tarjetas y Estados Reales:**
  * Código público determinístico `#EV-{8 primeros chars de publicUuid}` y montos reales en `S/.`.
  * Filtros alineados a estados reales: `Todos`, `En Venta`, `Sold Out`, `Borradores`, `Finalizados` y `Pausados/Canc.`.
  * **`draft`:** Oculta métricas financieras/zonas vendidas, muestra `draftChecklist` dinámico y botón **"Publicar Evento"** (`publishEventUseCase` con validación Plan B de verificación de email).
  * **`published` / `paused`:** Muestra recaudación neta en ventas (`S/.`), desglose de aforo y tarifas vigentes por zona y acción **"Solicitar Adelanto"** (`/organizer/settlement?eventId=...&mode=adelanto`).
  * **`completed`:** Reemplaza el botón de adelanto por **"Liquidación del Evento"** (`/organizer/settlement?eventId=...&mode=liquidacion`).





