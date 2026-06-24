# PROYECTO.md — LocalNow
## Documento maestro de arquitectura, diseño y producto

> Este archivo es el contexto completo del proyecto. Léelo íntegramente antes de escribir cualquier línea de código. Contiene todas las decisiones de producto, arquitectura técnica, modelos de datos, flujos de usuario y modelo de negocio acordados.

---

## 1. Visión general del producto

**LocalNow** es una revista digital local para ciudades de entre 50.000 y 150.000 habitantes que combina dos ámbitos diferenciados en una sola aplicación:

1. **Revista de noticias locales** — agregador dinámico tipo Flipboard con cuadrícula de tarjetas editoriales, clasificadas por temáticas locales.
2. **Directorio de comercio local** — escaparate de empresas locales con sistema de cupones, fidelización por puntos y campañas promocionales personalizadas.

El **toque diferencial y el modelo de negocio principal** es el sistema de datos de consumo local: la plataforma captura el comportamiento de compra de los usuarios en los comercios adheridos y lo convierte en inteligencia de mercado para campañas promocionales cruzadas entre comercios, sin exponer nunca datos individuales al exterior.

---

## 2. Plataformas objetivo

- **Web**: navegador de escritorio y móvil (Next.js)
- **Móvil**: iOS y Android (React Native / Expo)
- Ambas plataformas comparten la misma API backend y base de datos.
- El diseño es mobile-first pero completamente responsivo en escritorio.

---

## 3. Stack tecnológico decidido

### Frontend web
- **Next.js 14** con App Router
- **TailwindCSS** para estilos
- Diseño editorial tipo Flipboard con cuadrícula dinámica de tarjetas

### Frontend móvil
- **React Native** con **Expo**
- Expo Notifications para push notifications
- `expo-camera` para escaneo de QR
- `react-native-qrcode-svg` para generación de QR

### Backend
- **Node.js** con **NestJS** (arquitectura modular, ideal para escalar)
- API REST + WebSockets para actualizaciones en tiempo real (ticket, puntos)
- **Prisma** como ORM
- **PostgreSQL** como base de datos principal

### Infraestructura y servicios
- **Supabase** o **Clerk** para autenticación (dos roles: usuario/cliente y comercio)
- **Firebase Cloud Messaging** o **Expo Push** para notificaciones push
- **Redis** para caché de sesiones, rate limiting y colas de eventos
- **AWS S3** o **Supabase Storage** para imágenes de productos y logos de comercios
- **Stripe** para cobro de suscripciones mensuales a comercios

### Base de datos de códigos EAN
- Integración con **Open Food Facts API** (gratuita, open source) para autocompletar nombre, categoría e imagen de productos por código de barras EAN
- Productos sin EAN estándar (fruta, charcutería a granel) se crean como **PLU propios** del comercio

---

## 4. Ámbito 1 — Revista de noticias

### 4.1 Concepto editorial
La revista funciona como un agregador dinámico de fuentes locales. Las noticias se presentan en una cuadrícula tipo Flipboard donde las tarjetas tienen distintos tamaños según su relevancia (hero card, tarjeta doble, tarjeta wide, tarjeta estándar).

### 4.2 Categorías de noticias
- Municipio (ayuntamiento, concello)
- Deportes
- Economía
- Judicial
- Cultura
- Diputación / organismos oficiales
- Sociedad

### 4.3 Fuentes de noticias (por integrar)
- RSS de periódicos locales (Faro de Vigo, El Correo Gallego, etc.)
- BOE / BOPG (Boletín Oficial)
- Web del ayuntamiento / concello
- Diputación provincial
- SEPE (empleo)
- Sergas (sanidad, en Galicia)
- Federaciones deportivas locales
- Fuentes judiciales públicas

### 4.4 Modelo de tarjeta de noticia
Cada noticia en el feed contiene:
- Título
- Categoría (pill de color)
- Fuente
- Timestamp relativo ("hace 2 horas")
- Imagen de cabecera (opcional)
- Resumen corto (máx. 2 líneas)

### 4.5 Filtrado
El usuario puede filtrar por categoría mediante pills horizontales desplazables en la parte superior del feed.

---

## 5. Ámbito 2 — Comercio local

### 5.1 Concepto
Directorio de empresas locales adheridas a la plataforma. Cada comercio tiene un perfil con su información, ofertas activas y participa en el sistema de puntos y campañas.

### 5.2 Categorías de comercios
- Restauración
- Comercio (alimentación, moda, hogar...)
- Servicios (peluquería, taller, fontanería...)
- Ocio (bares, cine, actividades...)
- Salud (clínica, farmacia, óptica...)

### 5.3 Sistema de cupones
Los comercios pueden crear cupones con:
- Tipo: porcentaje de descuento, precio fijo, 2x1
- Fecha de inicio y caducidad
- Stock máximo de canjes
- Condiciones de uso (texto libre)
- Estado: borrador / en revisión / activo / expirado

El flujo de un cupón es:
1. Comercio crea el cupón desde su panel
2. La plataforma lo modera (automático o manual en fase inicial)
3. Se publica en el feed de empresas y en el perfil del comercio
4. El usuario lo activa → se genera un QR de un solo uso con caducidad de 15 minutos
5. El comercio escanea el QR con su app → la plataforma valida y descuenta el stock
6. Se registra el canje con timestamp para analítica

---

## 6. Sistema de fidelización por puntos

### 6.1 Filosofía del sistema
Simple, transparente y no invasivo. El cliente acumula puntos por euros gastados, sin distinción por producto. Los puntos extra por producto existen como herramienta promocional puntual que el comercio activa voluntariamente desde su panel.

### 6.2 Regla de acumulación principal
```
1€ gastado = X puntos (configurable por ciudad/plataforma, ej: 1€ = 2 puntos)
```

No hay distinción por producto en el día a día. El importe total de la compra es la base del cálculo.

### 6.3 Puntos extra por producto (opcional, para promociones)
Un comercio puede activar desde su panel que un producto concreto (identificado por EAN o PLU) otorgue puntos extra durante un período determinado. Esto se usa para campañas puntuales, no como norma.

### 6.4 Doble sistema de puntos (híbrido)
Cada compra genera dos tipos de puntos simultáneamente:

| Tipo | Nombre | Uso | Gestionado por |
|------|--------|-----|----------------|
| Puntos propios | Del comercio (ej: "Puntos Xin Long") | Canjeables solo en ese comercio | Cada comercio |
| Puntos globales | LocalNow | Canjeables en cualquier comercio adherido | Plataforma |

La ratio de conversión de euros a puntos puede ser diferente para cada tipo.

### 6.5 Recompensas / canje
El cliente accede a la sección "Mis puntos" en la app y ve:
- Su saldo de puntos globales LocalNow
- Su saldo de puntos propios por cada comercio donde ha comprado
- Lista de recompensas disponibles ordenadas por coste en puntos
- Recompensas bloqueadas (visibles pero con candado, mostrando cuántos puntos faltan)

Al seleccionar una recompensa:
1. Se genera un QR único en el servidor (no en el cliente)
2. El QR tiene caducidad de 15 minutos y es de un solo uso
3. El cliente lo muestra en el comercio
4. El comercio lo escanea → la plataforma valida, descuenta puntos y registra el canje
5. Confirmación instantánea en ambas apps

### 6.6 Seguridad del QR
- El QR se genera en el servidor con un token firmado (JWT o UUID v4 irrepetible)
- Se almacena en base de datos con estado: `PENDING` → `USED` o `EXPIRED`
- Al escanear, el servidor verifica: existencia, estado PENDING, no expirado, comercio correcto
- Una vez usado o expirado, no puede volver a validarse bajo ninguna circunstancia
- Imposible reutilizar por foto o captura de pantalla

---

## 7. Sistema de ticket digital

### 7.1 Concepto
Cuando un cliente realiza una compra en un comercio adherido, recibe en su app un ticket digital completo al instante, similar al ticket digital de Lidl Plus. Este ticket sustituye al ticket en papel y contiene el desglose completo de productos.

### 7.2 Flujo del momento del pago (sin fricción)

El proceso está diseñado para ser completamente no invasivo:

**Lado del comercio:**
1. El cliente paga normalmente (tarjeta, efectivo, Bizum — sin cambiar su comportamiento)
2. El comerciante introduce el importe y los productos en la app de LocalNow (tablet o móvil secundario en el mostrador)
3. La app genera un QR dinámico en pantalla

**Lado del cliente:**
1. El cliente abre LocalNow y escanea el QR del mostrador (2 segundos)
2. La plataforma procesa la compra en tiempo real
3. El cliente recibe una push notification instantánea: "Ticket recibido — +X puntos"
4. El ticket aparece en su historial con desglose completo

**Evolución por fases:**
- **Fase 1 (lanzamiento):** App de comercio en tablet/móvil → QR dinámico → cliente escanea
- **Fase 2:** Integración con Redsys / Stripe Terminal para TPVs compatibles
- **Fase 3:** NFC nativo + integraciones directas con fabricantes de TPV (Ingenico, Verifone)

### 7.3 Contenido del ticket digital

```
TICKET — Hiperchino Xin Long
Fecha: 20/06/2026 18:42 | Calle Real 14

EAN        Producto                 Cant.   Precio
────────────────────────────────────────────────────
8410036    Arroz SOS 1kg            ×2      2,90€
8480000    Aceite oliva Hacendado   ×1      5,49€
4005808    Detergente Persil        ×1      7,20€
PLU-038    Fruta variada (kg)       1.2kg   3,60€
8410376    Salsa de soja 500ml      ×2      3,18€
PLU-012    Fideos chinos (granel)   0.8kg   1,60€
────────────────────────────────────────────────────
Subtotal                                   23,97€
IVA (10%)                                   2,40€
Descuento socio                             0,00€
TOTAL PAGADO                               23,97€
────────────────────────────────────────────────────
Puntos ganados esta compra:  +47 pts LocalNow
Saldo LocalNow:           1.240 pts
Puntos Xin Long:            319 pts
```

### 7.4 Catálogo de productos del comercio

**Opción A — Importación CSV/XML:**
El comercio exporta su catálogo desde su software de gestión (Nemon, Solvermedia, Casio, Revo, etc.) y lo importa mediante un asistente en la plataforma. El sistema mapea automáticamente: código EAN, nombre, precio y categoría.

**Opción B — Alta manual con escáner:**
El comerciante escanea cada producto con la cámara del móvil. La plataforma consulta Open Food Facts API para autocompletar nombre, categoría e imagen. Para productos sin EAN (fruta, charcutería a peso) se crean PLU propios del comercio.

**Sincronización:** El catálogo puede actualizarse manualmente o mediante reimportación periódica del CSV.

---

## 8. Motor de datos de consumo y campañas

### 8.1 Filosofía de privacidad (crítica)
**El cliente NUNCA sabe por qué recibe una oferta concreta.** Solo ve mensajes genéricos como "Tenemos una oferta para ti en Supermercado López". Los datos de comportamiento individual se usan internamente para segmentación pero JAMÁS se revelan al cliente ni se ceden a terceros como datos individuales. Cumplimiento RGPD estricto por diseño.

El consentimiento se obtiene en el registro: el usuario acepta que sus datos de compra se usan para recibir ofertas personalizadas de comercios de la plataforma LocalNow.

### 8.2 Datos capturados por compra
Por cada transacción se registra:
- ID de cliente (anonimizado internamente con UUID)
- ID de comercio
- Timestamp exacto
- Importe total
- Lista de productos con EAN/PLU, cantidad y precio unitario
- Categorías de productos comprados
- Método de pago (si disponible)
- Si la compra fue motivada por una campaña previa (atribución)

### 8.3 Motor de segmentación
El backend procesa el historial de compras y construye segmentos dinámicos de clientes basados en comportamiento:

Ejemplos de segmentos:
- "Compra arroz al menos una vez cada 14 días"
- "Gasta más de 30€ por visita"
- "Compra productos de limpieza mensualmente"
- "Alta frecuencia de visita (más de 2 veces por semana)"
- "Sensible a descuentos" (ratio de conversión alto tras recibir ofertas)
- "Comprador de productos asiáticos"
- "Cliente nuevo en la zona (menos de 30 días de historial)"

Los segmentos son dinámicos: se recalculan periódicamente (job nocturno o en tiempo real según volumen).

### 8.4 Campañas — Modo híbrido

**Campañas sugeridas por IA (modo automático):**
El sistema detecta patrones y sugiere campañas al comercio desde su panel:
- "15 clientes que compran arroz semanalmente no han visitado tu comercio en 3 semanas. ¿Lanzar una oferta de reactivación?"
- "30 clientes nuevos en la zona. ¿Ofrecerles un descuento de bienvenida?"

El comercio recibe la sugerencia con los datos agregados (nunca individuales) y decide aprobarla, modificarla o descartarla.

**Campañas manuales (modo comercio):**
El comercio diseña su propia campaña desde el panel eligiendo:
- Segmento objetivo (de la lista de segmentos disponibles)
- Tipo de incentivo (% descuento, regalo, puntos extra)
- Fecha de inicio y fin
- Presupuesto máximo (número de canjes)
- Mensaje de la notificación push (genérico, sin revelar criterio de selección)

**Campañas cruzadas entre comercios:**
Un comercio puede pagar para impactar segmentos construidos con datos de otros comercios. Ejemplo:
- El Supermercado López quiere atraer clientes que habitualmente compran arroz y productos de limpieza en el Hiperchino Xin Long
- LocalNow identifica ese segmento y lanza la campaña del López hacia esos clientes
- El cliente recibe: "Oferta especial para ti en Supermercado López: 20% en arroz y productos de limpieza esta semana"
- El cliente no sabe que fue seleccionado por sus compras en Xin Long

### 8.5 Tres vías de monetización

| Vía | Descripción | Modelo de precio |
|-----|-------------|-----------------|
| Suscripción mensual | Cada comercio paga por estar en la plataforma y acceder a todas las funcionalidades | Fee fijo mensual (ej: 49€/mes) |
| Campañas dirigidas | Comercio B paga para impactar segmentos construidos con datos de la plataforma | CPM (coste por mil impactos) o CPA (coste por canje) |
| Informes de mercado | Tendencias de consumo local vendidas a marcas nacionales, distribuidores o asociaciones comerciales | Suscripción premium o fee por informe |

---

## 9. Alta y gestión de comercios

### 9.1 Flujo de alta de un comercio
1. El comercio rellena el formulario de registro: nombre, CIF, dirección, categoría, teléfono, email, logo
2. La plataforma verifica que el CIF corresponde a un negocio real y que está ubicado en la ciudad objetivo (geolocalización)
3. En fase inicial: revisión manual por el equipo de LocalNow (24-48h)
4. En fase de escala: verificación automática vía API del Registro Mercantil
5. Si se aprueba: se activa el perfil público y el panel de gestión privado
6. Si se rechaza: notificación por email con el motivo

### 9.2 Panel de gestión del comercio
El comercio accede a su panel (web y app) donde puede:
- Editar su perfil público (logo, descripción, horarios, dirección, fotos)
- Gestionar su catálogo de productos (importar CSV, añadir manualmente, editar precios)
- Crear y gestionar cupones (crear, pausar, activar, archivar)
- Ver sus campañas activas y el rendimiento (impresiones, canjes, ROI)
- Revisar y aprobar sugerencias de campaña de la IA
- Crear campañas manuales
- Ver analítica de puntos (puntos emitidos, canjeados, pendientes)
- Ver el dashboard de ventas (número de tickets procesados, importe total, ticket medio)
- Descargar informes mensuales en PDF
- Gestionar su suscripción y facturación

### 9.3 App del comercio para el punto de venta
Vista simplificada (tablet o móvil en el mostrador) con:
- Botón grande "Nueva venta"
- Selector de productos del catálogo (búsqueda por nombre o escaneo EAN)
- Campo de importe total
- Botón "Generar QR" → muestra el QR en pantalla grande para que el cliente lo escanee
- Vista de validación de QR (para cupones y canjes de puntos que trae el cliente)
- Historial de ventas del día

---

## 10. Roles de usuario

### 10.1 Usuario / Cliente (lector)
- Registro gratuito con email o Google/Apple Sign-in
- Acceso completo al feed de noticias sin registro
- Registro necesario para: cupones, puntos, ticket digital, campañas personalizadas
- Perfil: nombre, email, ciudad, preferencias de categorías de noticias, preferencias de comercios
- Acepta en el registro: términos de uso + política de privacidad + consentimiento de uso de datos de compra para personalización de ofertas (RGPD)

### 10.2 Comercio
- Registro de pago (suscripción mensual)
- Acceso al panel de gestión completo
- Vista de punto de venta en app

### 10.3 Administrador de plataforma (backoffice)
- Gestión de ciudades activas
- Moderación de comercios y cupones
- Gestión de campañas cruzadas entre comercios
- Analítica global de la plataforma
- Gestión de usuarios
- Configuración de ratio de puntos por ciudad

---

## 11. Modelo de datos (esquema conceptual)

### Entidades principales y sus relaciones:

```
CITY
  id, name, slug, active, points_ratio_global, created_at

USER
  id, email, name, phone, city_id (FK), avatar_url,
  consent_data_usage (bool), consent_date,
  created_at, updated_at

USER_POINTS_GLOBAL
  id, user_id (FK), balance, total_earned, total_redeemed, updated_at

COMMERCE
  id, name, slug, city_id (FK), category, cif, address,
  lat, lng, phone, email, logo_url, description,
  schedule (JSON), active, verified, subscription_status,
  subscription_plan, stripe_customer_id, created_at

COMMERCE_POINTS_CONFIG
  id, commerce_id (FK), points_ratio (pts por €),
  reward_threshold (pts para siguiente recompensa), updated_at

USER_POINTS_COMMERCE
  id, user_id (FK), commerce_id (FK), balance,
  total_earned, total_redeemed, updated_at

PRODUCT
  id, commerce_id (FK), ean (nullable), plu (nullable),
  name, category, price, unit (unit/kg/l), image_url,
  active, source (manual/import/openfoodfacts), created_at

TRANSACTION
  id, user_id (FK), commerce_id (FK), timestamp,
  total_amount, payment_method, points_global_earned,
  points_commerce_earned, campaign_id (FK, nullable),
  ticket_url (nullable), created_at

TRANSACTION_ITEM
  id, transaction_id (FK), product_id (FK), ean, plu,
  product_name, quantity, unit_price, line_total

COUPON
  id, commerce_id (FK), title, description, type (pct/fixed/2x1),
  value, start_date, end_date, max_redemptions,
  current_redemptions, status (draft/pending/active/expired),
  created_at

COUPON_REDEMPTION
  id, coupon_id (FK), user_id (FK), qr_token (unique),
  qr_expires_at, status (pending/used/expired),
  redeemed_at (nullable), created_at

REWARD
  id, commerce_id (FK, nullable — null = global LocalNow),
  title, description, points_cost, value_euros,
  type (discount_pct/discount_fixed/free_product/gift),
  active, created_at

REWARD_REDEMPTION
  id, reward_id (FK), user_id (FK), commerce_id (FK),
  qr_token (unique), qr_expires_at,
  status (pending/used/expired), redeemed_at (nullable),
  points_deducted, created_at

SEGMENT
  id, city_id (FK), name, description, rules (JSON),
  user_count (cached), last_computed_at, active

USER_SEGMENT
  id, user_id (FK), segment_id (FK), assigned_at, active

CAMPAIGN
  id, commerce_id (FK — el que paga), city_id (FK),
  name, type (auto_suggested/manual/cross_commerce),
  target_segment_id (FK, nullable),
  incentive_type (discount/points/gift),
  incentive_value, push_message, start_date, end_date,
  max_redemptions, current_redemptions,
  budget_euros (nullable), status (draft/active/paused/ended),
  suggested_by_ai (bool), approved_at, created_at

CAMPAIGN_IMPRESSION
  id, campaign_id (FK), user_id (FK), sent_at, opened (bool)

NEWS_SOURCE
  id, city_id (FK), name, url, feed_url, category,
  active, last_fetched_at

NEWS_ARTICLE
  id, source_id (FK), city_id (FK), title, summary,
  url, image_url, category, published_at, fetched_at,
  featured (bool)
```

---

## 12. Arquitectura de la API (endpoints principales)

### Auth
```
POST   /auth/register/user
POST   /auth/register/commerce
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout
```

### News (público)
```
GET    /news?city=:slug&category=:cat&page=:n
GET    /news/:id
```

### Commerce (público)
```
GET    /commerce?city=:slug&category=:cat
GET    /commerce/:id
GET    /commerce/:id/coupons
GET    /commerce/:id/rewards
```

### User (autenticado)
```
GET    /user/me
PUT    /user/me
GET    /user/points
GET    /user/tickets
GET    /user/tickets/:id
GET    /user/rewards/available
POST   /user/rewards/:id/redeem       → genera QR
GET    /user/coupons/active
POST   /user/coupons/:id/activate     → genera QR
```

### Commerce panel (comercio autenticado)
```
GET    /panel/dashboard
GET    /panel/products
POST   /panel/products
PUT    /panel/products/:id
POST   /panel/products/import-csv
GET    /panel/coupons
POST   /panel/coupons
PUT    /panel/coupons/:id
DELETE /panel/coupons/:id
POST   /panel/sale/new                → crea transacción + genera QR para cliente
POST   /panel/qr/validate             → valida QR de cupón o canje de puntos
GET    /panel/campaigns
POST   /panel/campaigns
PUT    /panel/campaigns/:id/approve   → aprobar sugerencia de IA
GET    /panel/analytics/sales
GET    /panel/analytics/points
GET    /panel/analytics/campaigns
```

### Admin (administrador)
```
GET    /admin/cities
POST   /admin/cities
GET    /admin/commerce/pending
PUT    /admin/commerce/:id/approve
GET    /admin/segments
POST   /admin/segments/recompute
GET    /admin/analytics/global
```

### QR Validation (interno, llamada desde app de comercio)
```
POST   /qr/validate
Body: { token: string, commerce_id: string }
Response: { valid: bool, type: 'coupon'|'reward', detail: {...} }
```

---

## 13. Flujos críticos detallados

### 13.1 Flujo completo de compra con ticket y puntos
```
1. Comercio abre "Nueva venta" en su app
2. Añade productos (por escaneo EAN o búsqueda) y el importe total
3. Pulsa "Generar QR" → POST /panel/sale/new (sin confirmar aún)
4. El servidor crea una transacción en estado PENDING y devuelve un QR token
5. El QR se muestra en pantalla del comercio
6. El cliente escanea con LocalNow (si está registrado) o simplemente no escanea
7. Si el cliente escanea: el token se vincula a su user_id → transacción pasa a CONFIRMED
8. El servidor calcula: puntos_global = total_amount × city.points_ratio_global
                        puntos_commerce = total_amount × commerce.points_ratio
9. Se actualizan USER_POINTS_GLOBAL y USER_POINTS_COMMERCE
10. Se generan los TRANSACTION_ITEMs con todos los productos
11. Se envía push notification al cliente: "Ticket en Xin Long — +47 pts"
12. El ticket aparece en el historial del cliente
13. Si el cliente no escanea en 5 minutos: transacción pasa a ANONYMOUS
    (se guardan los datos de venta pero sin vincular a usuario)
```

### 13.2 Flujo de generación y validación de QR de canje
```
1. Cliente selecciona recompensa en la app
2. POST /user/rewards/:id/redeem
3. El servidor verifica: ¿tiene suficientes puntos? ¿recompensa activa?
4. Si OK: genera UUID v4 único, almacena en REWARD_REDEMPTION con status=PENDING
          y qr_expires_at = now + 15 minutos
5. Devuelve el token al cliente → la app genera el QR visual a partir del token
6. El cliente muestra el QR al comercio
7. El comercio escanea → POST /qr/validate { token, commerce_id }
8. El servidor verifica: ¿token existe? ¿status=PENDING? ¿no expirado? ¿comercio correcto?
9. Si OK: actualiza REWARD_REDEMPTION a status=USED, redeemed_at=now
          deduce puntos del usuario
          devuelve confirmación al comercio
10. El comercio aplica el descuento en su TPV manualmente
11. El cliente recibe push: "Canje confirmado — −200 pts"
```

### 13.3 Flujo de campaña cruzada
```
1. Job nocturno recalcula segmentos basado en historial de transacciones
2. La IA detecta oportunidad: "Segmento 'compradores de arroz' tiene 340 usuarios,
   ningún comercio tiene campaña activa para ellos"
3. Se genera sugerencia para el Supermercado López (comercio B):
   "340 clientes potenciales en el segmento 'compradores de arroz'.
   ¿Lanzar campaña de 20% en arroz y limpieza?"
4. El comercio B aprueba desde su panel → campaña pasa a status=ACTIVE
5. El sistema envía push a cada USER en USER_SEGMENT donde segment_id = segmento objetivo
   Mensaje: "Oferta especial para ti en Supermercado López"
   (sin mencionar por qué fue seleccionado — NUNCA)
6. Se registra un CAMPAIGN_IMPRESSION por cada push enviado
7. Si el cliente va al López y compra: la transacción se registra con campaign_id
8. El comercio B ve en su panel: impresiones, canjes y ROI de la campaña
```

---

## 14. Consideraciones de privacidad y RGPD

- Los datos de comportamiento de compra son **datos personales** bajo el RGPD.
- El consentimiento se obtiene de forma explícita en el registro, con un checkbox específico.
- Los datos individuales **NUNCA se ceden a terceros** como datos identificables.
- Las campañas cruzadas funcionan mediante segmentos anónimos: el comercio B compra acceso al segmento, no a la lista de usuarios.
- El usuario tiene derecho a: acceder a sus datos, rectificarlos, eliminarlos y revocar el consentimiento (en cuyo caso se excluye de campañas pero puede seguir usando la app).
- Se debe contratar un **DPO (Delegado de Protección de Datos)** o asesoría especializada antes del lanzamiento.
- Todos los datos se almacenan en servidores dentro de la UE.
- El sistema debe incluir funcionalidad de "exportar mis datos" y "eliminar mi cuenta" desde el perfil del usuario.

---

## 15. Modelo de negocio y monetización

### 15.1 Ingresos
| Fuente | Descripción | Precio orientativo |
|--------|-------------|-------------------|
| Suscripción comercio Basic | Perfil + cupones + tickets | 29€/mes |
| Suscripción comercio Pro | Basic + campañas + analítica avanzada | 59€/mes |
| Campañas dirigidas | CPM o CPA sobre segmentos | 50-200€/campaña |
| Campañas cruzadas premium | Acceso a segmentos de otros comercios | 100-500€/campaña |
| Informes de mercado | Tendencias de consumo local | 200-1.000€/informe |

### 15.2 Estrategia de lanzamiento
- **Ciudad piloto**: una ciudad de 80.000-120.000 habitantes (p.ej. Pontevedra)
- **Fase 1 (meses 1-3)**: 10-20 comercios piloto, acceso gratuito para validar el producto
- **Fase 2 (meses 4-6)**: activar suscripciones de pago, campañas básicas
- **Fase 3 (mes 7+)**: campañas cruzadas, informes de mercado, expansión a segunda ciudad

---

## 16. Estructura de carpetas del proyecto

```
localnow/
├── apps/
│   ├── web/                    # Next.js 14 — web app
│   │   ├── app/
│   │   │   ├── (public)/       # Rutas públicas (noticias, directorio)
│   │   │   ├── (auth)/         # Login, registro
│   │   │   ├── (user)/         # Dashboard usuario autenticado
│   │   │   └── (panel)/        # Panel de gestión del comercio
│   │   └── components/
│   │       ├── news/           # Feed, tarjetas de noticias
│   │       ├── commerce/       # Directorio, perfil de comercio
│   │       ├── tickets/        # Ticket digital
│   │       ├── points/         # Puntos, recompensas
│   │       └── ui/             # Componentes reutilizables
│   └── mobile/                 # React Native / Expo
│       ├── app/                # Expo Router
│       │   ├── (tabs)/
│       │   │   ├── index.tsx   # Feed de noticias
│       │   │   ├── commerce.tsx
│       │   │   ├── tickets.tsx
│       │   │   └── points.tsx
│       │   └── panel/          # Vista de punto de venta del comercio
│       └── components/
├── packages/
│   ├── api/                    # NestJS backend
│   │   ├── src/
│   │   │   ├── auth/
│   │   │   ├── news/
│   │   │   ├── commerce/
│   │   │   ├── transactions/
│   │   │   ├── points/
│   │   │   ├── coupons/
│   │   │   ├── rewards/
│   │   │   ├── campaigns/
│   │   │   ├── segments/
│   │   │   ├── qr/
│   │   │   └── admin/
│   │   └── prisma/
│   │       └── schema.prisma
│   └── shared/                 # Tipos TypeScript compartidos
│       └── src/
│           ├── types/
│           └── constants/
├── PROYECTO.md                 # Este archivo
├── package.json                # Monorepo (Turborepo)
└── turbo.json
```

---

## 17. Instrucciones para Claude Code

Cuando trabajes en este proyecto, ten siempre en cuenta:

1. **Este es un monorepo con Turborepo.** Antes de crear cualquier archivo, verifica en qué `app` o `package` corresponde según la estructura de carpetas del punto 16.

2. **TypeScript estricto en todo el proyecto.** No uses `any`. Define siempre los tipos en `packages/shared/src/types/`.

3. **La base de datos es PostgreSQL con Prisma.** El schema está en `packages/api/prisma/schema.prisma`. Antes de crear cualquier endpoint, verifica que las entidades necesarias existen en el schema.

4. **Seguridad del QR es crítica.** Los tokens de QR siempre se generan en el servidor, nunca en el cliente. El endpoint `/qr/validate` debe verificar: existencia, estado PENDING, no expirado, comercio correcto — en ese orden.

5. **Los datos de consumo son el activo más valioso.** Asegúrate de que cada transacción registra correctamente todos los productos con su EAN/PLU. Sin este dato no funciona el motor de segmentación.

6. **Privacidad por diseño.** En ningún endpoint público ni en ninguna notificación push se debe revelar el motivo por el que un usuario fue seleccionado para una campaña. El push message siempre es genérico.

7. **El sistema de puntos tiene dos capas:** puntos globales LocalNow (tabla `USER_POINTS_GLOBAL`) y puntos propios de cada comercio (tabla `USER_POINTS_COMMERCE`). Ambas se actualizan en la misma transacción de base de datos.

8. **Mobile-first.** El diseño de componentes React Native prioriza la experiencia en móvil. La web es responsiva pero no es la plataforma principal de consumo.

9. **El panel del comercio tiene dos vistas muy distintas:**
   - Vista de gestión (web/app normal): donde configura todo
   - Vista de punto de venta (tablet en el mostrador): simplificada, solo para el momento de la venta

10. **Cuando se te pida implementar una feature nueva**, consulta primero este documento para verificar que no contradice ninguna decisión ya tomada. Si hay conflicto, pregunta antes de implementar.

---

*Documento generado el 20/06/2026. Versión 1.0.*
*Actualizar este documento cada vez que se tome una decisión de producto o arquitectura relevante.*
