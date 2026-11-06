# Flujo de Experiencia de Usuario (UX) - Validación y Control de Acceso QR

Este documento detalla la arquitectura de experiencia de usuario (UX/UI) para el personal de puerta y control de acceso de **Qué Planes Hoy**. Describe cada paso desde la apertura de la cámara hasta la resolución de contingencias (modo offline, duplicados, búsqueda manual de boletos dañados).

---

## 1. Diagrama de Flujo de Validación de Boletos QR

```mermaid
flowchart TD
    %% Definición de estilos visuales
    classDef step fill:#1E293B,stroke:#38BDF8,stroke-width:2px,color:#F8FAFC;
    classDef decision fill:#0F172A,stroke:#F59E0B,stroke-width:2px,color:#FDE68A;
    classDef success fill:#064E3B,stroke:#10B981,stroke-width:2px,color:#D1FAE5;
    classDef alert fill:#7F1D1D,stroke:#EF4444,stroke-width:2px,color:#FEE2E2;
    classDef warning fill:#78350F,stroke:#F59E0B,stroke-width:2px,color:#FEF3C7;
    classDef subg fill:#0F172A,stroke:#334155,stroke-width:1px,color:#94A3B8;

    %% FASE 1: PREPARACIÓN Y CONFIGURACIÓN DEL VALIDADOR
    subgraph F1 ["1. Apertura y Estado del Dispositivo"]
        A["Validador inicia sesión en Puerta<br/><code>/scanner</code> o <code>/sandbox</code>"]:::step --> B["Selecciona Evento y Puerta Asignada<br/>(Ej: Puerta 1 - Acceso General)"]:::step
        B --> C{"Verificación de Conectividad"}:::decision
        C -->|"Internet Activo (Online)"| D1["Sincroniza catálogo de boletos<br/>y claves públicas Ed25519"]:::step
        C -->|"Sin Señal (Offline)"| D2["Activa Modo Offline Autónomo<br/>(Usa base de datos IndexedDB local)"]:::warning
        D1 --> E["Activa Visor de Cámara con Retícula<br/>• Botón de Linterna / Flash accesible<br/>• Selector de cámara frontal/trasera"]:::step
        D2 --> E
    end

    %% FASE 2: CAPTURA Y PROCESAMIENTO DEL CÓDIGO QR
    subgraph F2 ["2. Escaneo y Lectura Criptográfica"]
        E --> F["Asistente presenta boleto en smartphone o impreso"]:::step
        F --> G{"¿El lente enfoca el código QR?"}:::decision
        G -->|"Sí, lectura correcta"| H["Decodifica payload firmado (Ed25519)<br/>Token UUID + Ticket ID + Hash"]:::step
        G -->|"No (Pantalla rota, batería baja, reflejo)"| I["Personal pulsa 'Búsqueda Manual'<br/>Digita DNI o Código Alfanumérico"]:::step
        I --> J["Sistema busca ticket por documento de identidad"]:::step
    end

    %% FASE 3: REGLAS DE NEGOCIO Y VALIDACIÓN
    subgraph F3 ["3. Validación de Estado y Reglas de Entrada"]
        H --> K{"Modo de Validación"}:::decision
        K -->|"Online"| L1["Consulta API <code>POST /tickets/validate</code><br/>Bloqueo atómico distribuido"]:::step
        K -->|"Offline"| L2["Valida firma digital Ed25519 con clave pública local<br/>Registra marca de tiempo en cola IndexedDB"]:::step
        
        L1 --> M{"Comprobación de Estado"}:::decision
        L2 --> M
        J --> M

        M -->|"Boleto Válido y No Canjeado"| N1{"¿Zona coincide con Puerta?"}:::decision
        M -->|"Boleto Ya Canjeado (Duplicado)"| N2["ALERTA FRAUDE: BOLETO YA ESCANEADO<br/>• Muestra hora del 1er escaneo<br/>• Muestra dispositivo/puerta previa"]:::alert
        M -->|"Firma Inválida o Evento Ajeno"| N3["ERROR: BOLETO NO REGISTRADO<br/>Código no pertenece a este evento"]:::alert

        N1 -->|"Zona Coincide"| O1["ACCESO AUTORIZADO (VERDE)<br/>• Sonido corto positivo bip-bip<br/>• Muestra: Nombre, DNI, Zona (VIP/Gen)<br/>• Badge de confirmación visual gigante"]:::success
        N1 -->|"Zona Diferente"| O2["ALERTA PUERTA INCORRECTA (ÁMBAR)<br/>• Boleto válido pero para otro acceso<br/>• Ej: 'Diríjase a Puerta 4 Boxes'"]:::warning
    end

    %% FASE 4: CICLO DE RE-ARMADO Y AUDITORÍA
    subgraph F4 ["4. Ciclo Rápido de Validación Continua"]
        O1 --> P["Actualiza métricas de aforo en pantalla<br/>(Ej: 342 ingresados / 500 cupo)"]:::step
        O2 --> P
        N2 --> Q["Personal de seguridad interviene o revisa DNI físico"]:::step
        N3 --> Q
        P --> R["Auto-rearme en 2.5 segundos<br/>o pulsar barra espaciadora / toque táctil"]:::step
        R --> E
        Q --> R
    end
```

---

## 2. Principios de UX/UI Aplicados al Control de Accesos

1. **Retroalimentación Cromática Instantánea (Split-Second Feedback):**
   - El personal de puerta procesa entre 10 y 20 personas por minuto.
   - El 90% de la pantalla cambia a color de alto impacto:
     - 🟢 **Verde Esmeralda (`#10b981`):** Ingreso autorizado.
     - 🔴 **Rojo Carmesí (`#ef4444`):** Entrada ya usada o fraudulenta.
     - 🟡 **Ámbar Intenso (`#f59e0b`):** Puerta incorrecta o advertencia.
2. **Ambiente de Luz Hostil y Modo Linterna:**
   - En festivales o discotecas no hay iluminación adecuada. La interfaz cuenta con botón flotante directo para encender la **Linterna (Torch)** y un modo de alto contraste oscuro para no encandilar al operario.
3. **Ergonomía Móvil con una Mano:**
   - Todos los controles primarios (Flash, Búsqueda Manual, Reanudar) están ubicados en el tercio inferior de la pantalla (zona natural del pulgar).
4. **Resiliencia Offline:**
   - La arquitectura garantiza validación en milisegundos incluso sin señal celular gracias a la firma digital **Ed25519**, sincronizando los accesos automáticamente cuando la red se restablezca.
5. **Detección Preventiva de Fraude:**
   - Si una persona intenta pasar con una captura de pantalla enviada por WhatsApp que ya ingresó, el sistema exhibe en rojo brillante la hora exacta del ingreso previo (`Ej: 21:14:02 hrs en Puerta 01`) permitiendo detectar el fraude al instante.
