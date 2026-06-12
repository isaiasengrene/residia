# ResidIA — Especificación Funcional y Técnica

> **Versión:** 2.0 — Junio 2026
> **Cliente piloto:** Fundación Federico Ozanam (Aragón, España)
> **Desarrollado por:** Engrene
> **Idioma del sistema:** Español — todas las interfaces, notificaciones, documentos y comunicaciones, sin excepción
> **Estado:** Listo para desarrollo. Pendiente de incorporar UX/UI.

---

## Índice

1. [Visión general del producto](#1-visión-general-del-producto)
2. [Marco legal obligatorio](#2-marco-legal-obligatorio)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Perfiles de usuario y control de acceso](#4-perfiles-de-usuario-y-control-de-acceso)
5. [Gestión de consentimientos RGPD](#5-gestión-de-consentimientos-rgpd)
6. [Módulos funcionales](#6-módulos-funcionales)
7. [Agentes de Inteligencia Artificial](#7-agentes-de-inteligencia-artificial)
8. [Capa de seguridad y protección de datos](#8-capa-de-seguridad-y-protección-de-datos)
9. [Garantías documentales](#9-garantías-documentales)
10. [Arquitectura técnica](#10-arquitectura-técnica)
11. [Contratos con terceros (DPA)](#11-contratos-con-terceros-dpa)
12. [Estrategia de pruebas](#12-estrategia-de-pruebas)
13. [Migración de datos históricos](#13-migración-de-datos-históricos)
14. [Roadmap de implementación](#14-roadmap-de-implementación)
15. [KPIs del producto](#15-kpis-del-producto)
16. [Requisitos no funcionales](#16-requisitos-no-funcionales)
17. [Plan de contingencia offline](#17-plan-de-contingencia-offline)
18. [Glosario](#18-glosario)

---

## 1. Visión general del producto

**ResidIA** es una plataforma de gestión digital para residencias de personas mayores y centros sociosanitarios en España. Su propósito es **digitalizar libros, registros e incidencias** con plena validez jurídica, incorporando Agentes de Inteligencia Artificial para automatizar la comunicación, el seguimiento asistencial y la gestión documental.

El sistema no sustituye el papel como obligación legal — crea un entorno documental que supera al soporte físico en todas las garantías: control, seguridad, trazabilidad y disponibilidad ante inspección.

### Principios rectores

| Principio | Descripción |
|-----------|-------------|
| **Legalidad** | Cada función responde a una norma vigente. Ninguna decisión de diseño compromete el cumplimiento normativo. |
| **Privacidad por diseño** | La protección de datos se incorpora desde la arquitectura, no como añadido posterior (Art. 25 RGPD). |
| **Trazabilidad total** | Toda acción sobre cualquier dato queda registrada, vinculada a un usuario identificado y sellada en el tiempo. |
| **Disponibilidad ante inspección** | Cualquier información requerida por la Administración se exporta en ≤ 5 minutos. |
| **IA como asistente, nunca como decisor** | Ningún agente IA puede firmar, aprobar ni tomar decisiones clínicas de forma autónoma. |
| **Idioma único** | Todo el contenido del sistema — interfaces, documentos, notificaciones, mensajes de error — exclusivamente en **español**. |

---

## 2. Marco legal obligatorio

Cada módulo funcional tiene indicadas las normas que lo sustentan. El cumplimiento no es opcional ni parcial.

### 2.1 Normativa europea

#### Reglamento eIDAS — UE 910/2014 (y eIDAS 2 — UE 2024/1183)
- **Requisito:** Firma electrónica reconocida para documentos que lo exigen. Sello de tiempo verificable en todos los registros. Integridad del contenido demostrable ante terceros sin depender del sistema ResidIA.

#### RGPD — Reglamento UE 2016/679
- **Requisito:** Base jurídica documentada para cada tratamiento. Consentimientos gestionables y auditables. Ejercicio de derechos de los interesados (acceso, rectificación, supresión, portabilidad, oposición). RAT actualizado. EIPD obligatoria antes del despliegue en producción.

### 2.2 Normativa estatal española

#### Ley 6/2020, de servicios electrónicos de confianza
- **Requisito:** Integración con QTSP reconocido para documentos con mayor valor probatorio (contratos de ingreso, consentimientos informados, PAI firmado).

#### LOPDGDD — Ley Orgánica 3/2018
- **Requisito:** Evaluación de necesidad de DPO. Registro interno de violaciones de seguridad. Notificación a la AEPD en ≤ 72 horas ante brecha con riesgo para los interesados.

#### ENS — Real Decreto 311/2022
- **Requisito:** Arquitectura alineada con controles ENS categoría **MEDIA** como mínimo (datos de salud). Política de seguridad documentada. Auditoría de seguridad externa anual.

#### ENI — Real Decreto 4/2010
- **Requisito:** Exportación en formatos abiertos estándar: PDF/A para documentos firmados, XML/JSON para datos estructurados. Metadatos mínimos obligatorios en cada documento.

#### Ley 41/2002, de autonomía del paciente y documentación clínica
- **Requisito:** Historia socio-sanitaria con acceso restringido por perfil. Conservación mínima 5 años tras baja del residente; 15 años para documentación clínica relevante. El residente o representante legal puede solicitar copia exportada en cualquier momento.

### 2.3 Normativa autonómica (Aragón — primer mercado)

#### Ley 5/2009, de Servicios Sociales de Aragón
- **Requisito:** Informes y registros en formatos exigidos por la Administración aragonesa. Perfil de inspector con acceso temporal de solo lectura.

#### Decreto 111/1992 de Aragón
- **Requisito:** El Libro de Incidencias digital debe contemplar todos los campos exigidos: fecha, hora, tipo, residente afectado, profesional que notifica, descripción, medidas adoptadas y firma del responsable.

### 2.4 Tensión legal resuelta: derecho al olvido vs. retención obligatoria

Cuando un residente o representante legal solicita la supresión de datos (Art. 17 RGPD), el sistema no elimina datos clínicos de forma automática — la Ley 41/2002 impone retención de hasta 15 años.

**Procedimiento obligatorio ante solicitud de supresión:**
1. El sistema registra la solicitud en el audit log con timestamp.
2. Se crea un workflow para el DPO/Administrador con el análisis de qué puede suprimirse y qué no.
3. Datos identificativos no clínicos → se anonimizan donde la ley lo permita.
4. Registros clínicos → se conservan con la anotación legal que impide la supresión.
5. El DPO documenta la decisión y las acciones tomadas. Todo queda en el expediente.

Este procedimiento es la respuesta válida ante la AEPD: se demuestra que se intentó cumplir hasta donde la ley permite y se documentó el conflicto normativo.

---

## 3. Modelo de datos

### 3.1 Entidades principales

```
Centro
├── id (UUID)
├── nombre
├── cif
├── direccion
├── comunidad_autonoma
├── numero_autorizacion_admin   ← exigido por Ley 5/2009
├── schema_db                   ← nombre del schema PostgreSQL asignado
├── plan_contratado
├── fecha_alta
└── activo

Usuario
├── id (UUID)
├── centro_id
├── nombre_completo
├── email
├── telefono_verificado         ← vinculado al Agente WhatsApp
├── perfil (enum: ADMIN_CENTRO, COORDINADOR, SANITARIO, AUXILIAR,
│           TRABAJADOR_SOCIAL, FAMILIAR, INSPECTOR, SUPERADMIN)
├── residentes_asignados[]      ← solo aplica a SANITARIO y AUXILIAR
├── 2fa_activo
├── activo
├── fecha_ultimo_acceso
└── created_at

Residente
├── id (UUID)
├── centro_id
├── nombre_completo
├── dni_nie
├── fecha_nacimiento
├── fecha_ingreso
├── fecha_baja (nullable)
├── habitacion
├── unidad
├── estado (ACTIVO, BAJA_TEMPORAL, BAJA_DEFINITIVA, FALLECIDO)
├── tiene_representante_legal   (bool)
├── representante_legal_id      (FK → Usuario o ContactoExterno)
├── consentimiento_activo       (bool)
├── version_consentimiento      (FK → VersionPolitica)
└── created_at

Expediente
├── id (UUID)
├── residente_id
├── seccion (enum: IDENTIFICACION, SOCIAL, CLINICA, PAI,
│            MEDICACION, LEGAL, INCIDENCIAS)
├── contenido (jsonb cifrado con pgcrypto + KMS)
├── version
├── creado_por (FK → Usuario)
├── hash_sha256
├── timestamp_tsa
├── firmado_por (nullable, FK → Usuario)
├── firma_electronica (nullable)
└── created_at

Incidencia
├── id (UUID)
├── residente_id
├── tipo (enum según catálogo)
├── area_implicada
├── prioridad (enum: BAJA, MEDIA, ALTA, URGENTE)
├── descripcion
├── medidas_adoptadas
├── accion_requerida (bool)
├── descripcion_accion (nullable)
├── resuelta (bool)
├── descripcion_resolucion (nullable)
├── notificado_por (FK → Usuario)
├── origen (enum: WEB, WHATSAPP_AGENTE)
├── hash_sha256                 ← inmutable desde creación
├── timestamp_tsa
└── created_at

PAI  (Plan de Atención Individualizada)
├── id (UUID)
├── residente_id
├── version (int, auto-incremental)
├── contenido (jsonb cifrado)
├── generado_por_ia (bool)
├── aviso_ia_mostrado (bool)    ← el profesional vio el aviso legal
├── creado_por (FK → Usuario)
├── revisado_por (FK → Usuario, nullable)
├── firmado_por (FK → Usuario, nullable)
├── firma_electronica (nullable)
├── hash_sha256
├── timestamp_tsa
├── fecha_proxima_revision
└── created_at

Turno
├── id (UUID)
├── usuario_id
├── inicio
├── fin (nullable)
├── firma_inicio
├── firma_fin (nullable)
├── resumen_ia (text, nullable) ← generado por Agente Seguimiento
└── created_at

AuditLog  (tabla append-only con hash encadenado)
├── id (BIGSERIAL)
├── hash_anterior               ← SHA-256 del registro anterior
├── hash_propio                 ← SHA-256 de (hash_anterior + payload)
├── timestamp_utc
├── timestamp_tsa               ← sello externo TSA
├── usuario_id
├── perfil
├── accion (enum: CREATE, READ, UPDATE, EXPORT,
│           LOGIN, LOGOUT, FAILED_AUTH, CONSENT_GIVEN,
│           CONSENT_WITHDRAWN, PERMISSION_CHANGE,
│           AI_DRAFT_GENERATED, AI_DRAFT_CONFIRMED,
│           AI_FIELD_CORRECTED)
├── recurso
├── recurso_id
├── residente_id (nullable)
├── ip_origen
├── dispositivo
├── resultado
└── detalle (jsonb)

Consentimiento
├── id (UUID)
├── residente_id
├── firmado_por_id              ← residente o representante legal
├── tipo_firmante (enum: PROPIO, REPRESENTANTE_LEGAL, TUTOR)
├── documento_tutela_id (nullable, FK → Documento)
├── version_politica_id         ← versión exacta del texto aceptado
├── fecha_firma
├── firma_electronica
├── hash_sha256
├── timestamp_tsa
├── estado (enum: ACTIVO, RETIRADO, EXPIRADO)
├── fecha_retirada (nullable)
└── motivo_retirada (nullable)

VersionPolitica
├── id (UUID)
├── version (semver: "1.0.0")
├── fecha_vigencia
├── contenido_texto
├── hash_sha256
└── activa (bool)
```

### 3.2 Reglas de inmutabilidad

- `AuditLog`: solo INSERT. Ningún rol puede ejecutar UPDATE ni DELETE sobre esta tabla. Controlado a nivel de base de datos con permisos de PostgreSQL.
- `Incidencia`: después de `created_at`, los campos `descripcion`, `notificado_por`, `hash_sha256` y `timestamp_tsa` son inmutables. Solo se puede añadir `medidas_adoptadas`, `resuelta` y `descripcion_resolucion`.
- `PAI`: inmutable una vez firmado (`firmado_por IS NOT NULL`). Las actualizaciones crean una nueva fila con `version + 1`.
- `Expediente`: inmutable una vez firmado. Las actualizaciones crean nueva versión.
- `Consentimiento`: inmutable una vez creado. La retirada crea un nuevo registro con `estado = RETIRADO`.

### 3.3 Estrategia de soft-delete

Los datos de residentes **nunca se eliminan físicamente** dentro del período de retención. Se usa `fecha_baja` y `estado` en `Residente`. Los datos identificativos se pueden anonimizar (reemplazar por tokens) ante solicitud de supresión válida, pero el registro clínico se conserva.

---

## 4. Perfiles de usuario y control de acceso

El sistema implementa **RBAC (Role-Based Access Control)** con permisos granulares por módulo, acción y residente asignado.

### 4.1 Perfiles del sistema

| Perfil | Descripción | Acceso |
|--------|-------------|--------|
| **ADMIN_CENTRO** | Director/a o gerente del centro | Lectura/escritura total en todos los módulos del centro. No puede borrar registros firmados ni el audit log. |
| **COORDINADOR** | Coordinador/a asistencial o de enfermería | Lectura/escritura en módulos asistenciales. Acceso a todos los residentes del centro. |
| **SANITARIO** | Médico/a, enfermero/a, fisioterapeuta | Lectura/escritura en expediente clínico y PAI de residentes asignados o en guardia activa. |
| **AUXILIAR** | Gerocultor, auxiliar de enfermería | Escritura de incidencias y registro de turno. Lectura limitada al turno activo y a los residentes asignados. |
| **TRABAJADOR_SOCIAL** | Trabajador/a social | Lectura/escritura del expediente social. Sin acceso a historia clínica completa ni medicación. |
| **FAMILIAR** | Familiar o representante legal designado | Solo lectura del residente vinculado. Sin datos clínicos detallados. Requiere consentimiento previo registrado. |
| **INSPECTOR** | Funcionario de la Administración o auditor | Solo lectura y exportación. Sin modificación. Acceso temporal con fecha de expiración. Trazabilidad reforzada. |
| **SUPERADMIN** | Soporte técnico Engrene | Acceso técnico de emergencia. Nunca accede a contenido clínico. Todo acceso en audit log separado y visible para el ADMIN_CENTRO. |

### 4.2 Matriz de acceso por módulo

| Módulo | ADMIN | COORD | SANIT | AUXIL | T.SOC | FAMILIAR | INSPECT |
|--------|-------|-------|-------|-------|-------|----------|---------|
| Libro de Incidencias | R/W | R/W | R/W* | W | R | — | R |
| Expediente — Identificación | R/W | R/W | R/W | R | R/W | R | R |
| Expediente — Social | R/W | R/W | R | — | R/W | — | R |
| Expediente — Clínico | R | R/W | R/W* | — | — | — | R |
| PAI | R/W | R/W | R/W* | — | — | — | R |
| Medicación | R | R/W | R/W* | — | — | — | R |
| Turnos | R/W | R/W | R/W | R/W | — | — | R |
| Portal Familiares | Config | — | — | — | — | R | — |
| Audit Log | R | — | — | — | — | — | R |
| Panel Admin | R/W | R | — | — | — | — | — |
| Módulo Inspección | R/W | — | — | — | — | — | R/Export |

`*` Restringido a residentes asignados o guardia activa.

### 4.3 Reglas de control de acceso

- Un usuario accede solo a los residentes a los que esté explícitamente asignado, salvo que esté en guardia activa (que amplía temporalmente el acceso a todos los residentes del turno).
- Ningún perfil puede eliminar ni modificar un registro ya firmado. Solo se permiten anotaciones posteriores con nuevo sello de tiempo.
- Todo cambio de permisos queda en el audit log con identificación del administrador que lo realizó.
- Sesiones: máximo 8 horas para profesionales. Máximo 30 minutos en dispositivo compartido (configurable por el centro). Máximo 2 sesiones simultáneas por usuario.
- Autenticación: usuario + contraseña + **2FA obligatorio** para todos los perfiles con acceso a datos clínicos (ADMIN, COORD, SANITARIO, TRABAJADOR_SOCIAL, INSPECTOR).
- JWT con expiración de 1 hora + refresh tokens rotantes. El refresh token queda invalidado al cerrar sesión.

---

## 5. Gestión de consentimientos RGPD

Esta sección es **bloqueante para el go-live**. Sin consentimientos auditables no puede emitirse la EIPD.

### 5.1 Flujo de recogida en el ingreso

```
INGRESO DEL RESIDENTE
        │
        ▼
Sistema verifica capacidad legal del residente
        │
   ┌────┴──────────────────────────────┐
   │                                   │
Capacidad plena                 Sin capacidad / tutela / demencia
   │                                   │
   │                      Sistema exige:
   │                      · Upload documento de tutela/representación
   │                      · Registro del representante legal (Usuario o
   │                        ContactoExterno con datos verificados)
   │                                   │
   └──────────────┬────────────────────┘
                  │
                  ▼
Sistema presenta Política de Privacidad
(versión activa, con fecha y número de versión visibles)
+ lista explícita de tratamientos y finalidades
                  │
                  ▼
Firma electrónica del residente o representante legal
(tablet en el centro o enlace seguro por email, validez 48h)
                  │
                  ▼
Documento PDF/A generado automáticamente con:
· Texto íntegro de la política en la versión firmada
· Identidad del firmante y relación con el residente
· Sello de tiempo TSA
· Hash SHA-256
· Almacenado en expediente como inmutable
                  │
                  ▼
Estado consentimiento: ACTIVO
Acceso a módulos clínicos: HABILITADO
```

### 5.2 Cambio de versión de la política de privacidad

Cuando se publica una nueva versión de la política:
1. El sistema identifica todos los residentes con consentimiento en versión anterior.
2. Crea una tarea pendiente para el trabajador social: renovar consentimiento.
3. Los módulos con datos de categoría especial pasan a modo **solo lectura** para ese residente hasta que se renueve el consentimiento (configurable: periodo de gracia máximo 30 días).

### 5.3 Retirada de consentimiento

```
Solicitud de retirada registrada en audit log
        │
        ▼
Sistema NO elimina datos automáticamente
        │
        ▼
Workflow automático para DPO / ADMIN_CENTRO:
· Datos identificativos no clínicos → evaluar anonimización
· Registros clínicos → retención obligatoria (Ley 41/2002)
· Comunicaciones con familiares → evaluar eliminación
        │
        ▼
DPO documenta decisión y ejecuta acciones permitidas
Todo queda registrado con timestamp en expediente y audit log
        │
        ▼
Estado consentimiento: RETIRADO
Acceso del residente o familiar al portal: DESHABILITADO
```

### 5.4 Residentes sin capacidad legal

- Si el residente no tiene capacidad para consentir, el sistema solo acepta el consentimiento del representante legal acreditado.
- El documento de tutela o representación legal debe estar subido al sistema y verificado por el ADMIN_CENTRO antes de que el flujo de consentimiento esté disponible.
- Esta condición queda reflejada en el expediente y en el audit log.

---

## 6. Módulos funcionales

### 6.1 Libro de Incidencias Digital

**Base legal:** Decreto 111/1992 Aragón · Ley 5/2009 · eIDAS · ENS

**Campos obligatorios:**

| Campo | Tipo | Regla |
|-------|------|-------|
| Fecha y hora | Timestamp + sello TSA | Auto-generado, no editable |
| Residente afectado | FK → Residente | Obligatorio |
| Tipo de incidencia | Enum (catálogo configurable) | Obligatorio |
| Área implicada | Enum | Obligatorio |
| Prioridad | BAJA / MEDIA / ALTA / URGENTE | Obligatorio |
| Profesional que notifica | FK → Usuario (desde sesión activa) | Auto-rellenado |
| Descripción | Texto libre | Mínimo 20 caracteres |
| Medidas adoptadas | Texto libre | Obligatorio si prioridad ALTA o URGENTE |
| Acción requerida | Bool + descripción | Obligatorio |
| Origen | WEB / WHATSAPP_AGENTE | Auto-generado |
| Hash SHA-256 | Generado al guardar | Inmutable |

**Catálogo base de tipos** (configurable por centro):
- Caída / Accidente
- Deterioro de salud
- Conducta disruptiva
- Problema con medicación
- Incidencia de seguridad
- Queja / Reclamación
- Incidencia técnica o de instalaciones
- Otros (descripción obligatoria)

**Reglas de negocio:**
- Incidencias URGENTE y ALTA: notificación push inmediata al COORDINADOR y ADMIN_CENTRO.
- Una incidencia con `accion_requerida = true` no puede marcarse como resuelta sin registrar la resolución.
- El hash SHA-256 se genera en el servidor en el momento del INSERT, nunca en el cliente.

### 6.2 Expediente del Residente

**Base legal:** Ley 41/2002 · RGPD · LOPDGDD · ENS

Todo acceso al expediente —incluida la lectura— queda registrado en el audit log con la sección consultada. Los documentos son inmutables una vez firmados; las actualizaciones crean nuevas versiones conservando el histórico completo.

**Secciones y acceso:** ver matriz de acceso en §4.2.

**Exportación:** el residente o representante legal puede solicitar copia exportada en PDF/A firmado. La solicitud y la entrega quedan en el audit log.

### 6.3 Gestión de Turnos

**Base legal:** ENS (disponibilidad) · RGPD (minimización)

- Registro de inicio y fin de turno con firma electrónica del profesional.
- Traspaso de turno: resumen generado por el Agente de Seguimiento de incidencias y novedades del turno saliente, visible para el turno entrante.
- Las notificaciones con contenido clínico nunca se envían por canales no cifrados. Por WhatsApp o email solo se envía una alerta genérica con redirección al sistema.

### 6.4 Plan de Atención Individualizada (PAI)

**Base legal:** Ley 41/2002 · Ley 5/2009 · RGPD

- Control de versiones completo. Cada versión es un registro separado e inmutable una vez firmado.
- Comparativa visual entre versiones anteriores.
- Generación de borrador por el Agente IA con aviso legal obligatorio antes de la firma (ver §7.4).
- Alerta automática cuando el PAI lleva más de 6 meses sin revisión.
- Exportación en PDF/A firmado para inspección o traslado del residente.

### 6.5 Portal de Familiares

**Base legal:** RGPD · Ley 41/2002 · Ley 5/2009

- Acceso exclusivo al residente vinculado, previa verificación de identidad y registro de consentimiento.
- Visualización de participación en actividades y mensajes de bienestar general.
- Respuesta a preguntas frecuentes mediante Agente IA (sin datos clínicos en respuestas).
- Solicitud de visita o videollamada.
- Descarga de documentos que el centro haya autorizado explícitamente.
- Nunca se muestra información clínica detallada: solo información de bienestar general.

### 6.6 Panel de Administración del Centro

**Base legal:** Ley 5/2009 · ENS · RGPD

- Dashboard: incidencias activas, PAI pendientes de revisión, turnos cubiertos, consentimientos vencidos.
- Gestión de usuarios: alta, baja, modificación de permisos (todo trazado en audit log).
- Gestión del RAT: generación y actualización del Registro de Actividades de Tratamiento.
- Exportación de registros para inspección (por rango de fechas, tipo, residente).
- Alertas de cumplimiento: documentos próximos a vencer, firmas pendientes, PAI sin revisar.
- Gestión del Registro de Violaciones de Seguridad.

### 6.7 Módulo de Auditoría e Inspección

**Base legal:** eIDAS · ENS · Ley 5/2009 · Decreto 111/1992

- Generación de paquetes de auditoría: documentos firmados + metadatos + audit log, empaquetados en ZIP firmado con sello de tiempo.
- Filtros por residente, periodo, tipo de registro, profesional.
- Certificado de integridad verificable por terceros sin depender del sistema ResidIA.
- Credencial temporal para inspectores: solo lectura, fecha de expiración, scope limitado al periodo solicitado. La credencial y su uso quedan en el audit log.

---

## 7. Agentes de Inteligencia Artificial

### 7.1 Decisiones técnicas de IA

**Modelo LLM:** Claude API (Anthropic)
- Justificación: mejor rendimiento en español para extracción estructurada de texto clínico con errores fonéticos y abreviaciones de enfermería. DPA disponible con Anthropic bajo EU-US Data Privacy Framework.
- **Obligatorio:** DPA firmado con Anthropic antes del primer procesamiento de datos en producción.

**Capa de pseudonimización obligatoria:**
Ningún dato identificativo real llega a la API de Claude. Antes de cada llamada, el servicio de agentes ejecuta:

```
Datos reales en el sistema:
"El residente Juan García Martínez, habitación 12, sufrió
una caída en el baño. Diagnóstico previo: Alzheimer moderado."

Lo que recibe Claude:
"El residente [RES-4471], unidad [UNIT-B], sufrió una caída
en [ZONE-3]. Diagnóstico previo: [COND-7]."

Respuesta de Claude:
"Prioridad: Alta. Tipo: Caída/Accidente.
Acción requerida: Sí — valoración por [PROF-ENFER].
Patrón: tercer episodio en [ZONE-3] en 30 días."

Servicio re-asocia tokens → resultado final con datos reales.
```

Los tokens de sustitución se generan por sesión de procesamiento, se almacenan solo en memoria durante la llamada y nunca se persisten. Claude nunca ve nombres reales, habitaciones reales ni diagnósticos en texto libre.

**Vector database para contexto (RAG):**
El Agente de Seguimiento usa pgvector (extensión de PostgreSQL) para búsqueda semántica dentro del schema del centro. Los embeddings se generan a partir de texto ya pseudonimizado y se almacenan en la misma base de datos cifrada. Nunca salen de la infraestructura del cliente.

### 7.2 Agente de Registro Unificado (WhatsApp → Libro Digital)

**Disponibilidad:** 24/7

**Flujo:**
1. El profesional envía texto, audio o imagen al número de WhatsApp Business del centro.
2. El sistema verifica que el número está registrado y activo. Si no está registrado, rechaza y no procesa.
3. El audio se transcribe con Whisper (servicio interno, no externo).
4. El texto se pseudonimiza y se envía a Claude para extracción de campos estructurados con confidence score por campo.
5. Si algún campo obligatorio tiene confidence < 0.85, el Agente pregunta explícitamente antes de continuar.
6. Se presenta al profesional un borrador en WhatsApp para confirmación.
7. Tras confirmación, el registro se guarda con firma del profesional y sello de tiempo TSA.
8. El Agente responde con número de registro y clasificación asignada. Sin datos clínicos en la respuesta.

**Campos extraídos + confidence mínimo requerido:**

| Campo | Confidence mínimo | Si no alcanza |
|-------|-------------------|---------------|
| Residente afectado | 0.90 | Pregunta obligatoria |
| Tipo de incidencia | 0.80 | Sugiere opciones del catálogo |
| Prioridad | 0.75 | Asigna MEDIA y señala la incertidumbre |
| Área implicada | 0.75 | Sugiere opciones |
| Acción requerida | 0.80 | Pregunta obligatoria |

**Reglas de seguridad:**
- Número de teléfono verificado en sistema antes de cualquier interacción.
- Ningún dato del mensaje se almacena en servidores de Meta más allá del tránsito necesario.
- El contenido clínico nunca se responde por WhatsApp: solo confirmaciones de registro con número de referencia.
- El audio original no se almacena tras la transcripción (configurable por el centro).

### 7.3 Agente de Comunicación con Familias

**Disponibilidad:** 24/7 para preguntas generales. Información sobre el residente solo en horario configurado por el centro.

**Flujo:**
1. El familiar contacta por WhatsApp Business con el número del centro.
2. El sistema verifica identidad del familiar y el residente vinculado (número de teléfono registrado + código de verificación en primer contacto).
3. Responde preguntas frecuentes (horarios, actividades, trámites) sin datos clínicos.
4. Para estado del residente: genera mensaje de bienestar general basado en las últimas entradas no clínicas del sistema. Sin diagnósticos, medicación ni incidencias detalladas.
5. Consultas que requieren valoración clínica: derivadas al equipo humano con notificación inmediata al COORDINADOR.

**Mensajes proactivos automáticos** (configurables por el centro):
- Confirmación de participación en actividades.
- Resumen semanal de bienestar general.
- Avisos de citas, revisiones o documentación pendiente de firma.

**Reglas de seguridad:**
- El familiar debe haber dado consentimiento explícito para recibir comunicaciones por WhatsApp (campo en su registro de usuario).
- Si existe representante legal designado, los familiares sin esa condición no reciben información sobre el estado del residente.

### 7.4 Agente de Seguimiento Inteligente

**Disponibilidad:** Proceso en segundo plano, resultados disponibles bajo demanda.

**Funcionalidades:**
- Analiza incidencias, notas de evolución y novedades de turno mediante búsqueda semántica (pgvector).
- Genera resumen de turno para el COORDINADOR al inicio de cada turno.
- Detecta patrones: ≥ 3 incidencias del mismo tipo en 30 días para un mismo residente → alerta preventiva al COORDINADOR y SANITARIO asignado.
- Búsqueda en lenguaje natural desde la interfaz: "¿qué incidencias de caída ha tenido el residente X en los últimos 3 meses?" → extracto de los registros del sistema.
- Todo resultado de búsqueda queda en el audit log con el usuario que realizó la consulta.

### 7.5 Agente de Automatización PAI

**Disponibilidad:** Bajo demanda desde el módulo PAI.

**Funcionalidades:**
- Analiza historial de incidencias, evolución y tratamientos del residente (pseudonimizados antes de enviar a Claude).
- Genera borrador de actualización del PAI.
- Compara la nueva versión con las anteriores y destaca cambios relevantes.

**Aviso legal obligatorio antes de la firma:**
Antes de que el COORDINADOR pueda firmar un PAI generado o asistido por IA, el sistema muestra obligatoriamente:

> *"Este borrador fue generado con asistencia de Inteligencia Artificial. Revise y valide toda la información antes de firmar. La responsabilidad clínica de este documento recae íntegramente en el profesional firmante."*

El profesional debe confirmar que ha leído el aviso (checkbox). Esta confirmación queda registrada en el audit log con `accion: AI_DRAFT_CONFIRMED` antes de habilitar la firma.

**Regla absoluta:** El Agente nunca firma, aprueba ni valida un PAI de forma autónoma. Es un asistente de redacción, no un decisor clínico.

---

## 8. Capa de seguridad y protección de datos

Todos los requisitos de esta sección son **obligatorios y no negociables**.

### 8.1 Clasificación de datos

| Categoría | Ejemplos | Tratamiento |
|-----------|----------|-------------|
| **Categoría especial** (Art. 9 RGPD) | Historia clínica, medicación, diagnósticos, dependencia, salud mental | Cifrado AES-256 a nivel de columna (pgcrypto + AWS KMS). Acceso con 2FA obligatorio. Audit log completo incluyendo lecturas. |
| **Personales ordinarios** | Nombre, DNI, teléfono, dirección | Cifrado en reposo. Acceso por perfil. |
| **Operativos** | Turnos, actividades, estadísticas agregadas | Protección estándar. Sin datos identificativos en exportaciones anónimas. |

### 8.2 Cifrado

- **En tránsito:** TLS 1.3. No se admiten versiones anteriores. HSTS habilitado.
- **En reposo — datos de categoría especial:** AES-256 a nivel de columna con pgcrypto. Las claves se almacenan en AWS KMS (o Azure Key Vault). Las claves nunca coexisten con los datos que protegen.
- **En reposo — resto de datos:** AES-256 a nivel de disco (cifrado transparente del volumen de la base de datos).
- **Documentos (S3/Blob):** SSE-KMS. Cada objeto cifrado con clave derivada del centro.
- **Backups:** cifrados con la misma política. Claves de backup en ubicación geográfica separada, dentro de la UE.

### 8.3 Autenticación y autorización

- **2FA obligatorio** para ADMIN_CENTRO, COORDINADOR, SANITARIO, TRABAJADOR_SOCIAL e INSPECTOR.
- Contraseñas: mínimo 12 caracteres, obligatorio mayúscula + número + símbolo. Rotación cada 90 días. Historial de últimas 10 contraseñas.
- Bloqueo de cuenta tras 5 intentos fallidos. Desbloqueo solo por ADMIN_CENTRO o proceso de verificación de identidad documentado.
- JWT con expiración de 1 hora. Refresh tokens rotantes con expiración de 8 horas. Invalidación inmediata al cerrar sesión.
- Máximo 2 sesiones simultáneas por usuario. La tercera sesión invalida la más antigua con notificación al usuario.

### 8.4 Gestión de secretos

Ningún secreto en variables de entorno en texto plano en producción. Todos los secretos (credenciales WhatsApp Business API, API key Claude, credenciales de base de datos, claves de firma) se almacenan y rotan en **AWS Secrets Manager** (o HashiCorp Vault). Rotación automática programada para credenciales con soporte de rotación. La aplicación recupera los secretos en tiempo de ejecución, nunca en tiempo de build ni en el repositorio.

### 8.5 Audit Log inmutable con hash encadenado

La tabla `AuditLog` es **append-only** a nivel de base de datos:
```sql
REVOKE UPDATE, DELETE ON audit_log FROM ALL;
GRANT INSERT, SELECT ON audit_log TO app_role;
```

Cada registro contiene el `hash_anterior` (SHA-256 del registro previo) y su propio `hash_propio` (SHA-256 del contenido + `hash_anterior`). Esta cadena permite detectar cualquier manipulación retroactiva sin depender de un sistema externo. Además, cada registro recibe sello de tiempo de una TSA cualificada externa.

**Propiedades:**
- Retención mínima: 5 años.
- Acceso: ADMIN_CENTRO, INSPECTOR, SUPERADMIN (con trazabilidad de su propio acceso).
- Exportación: CSV firmado digitalmente para inspección.
- Verificación de integridad de la cadena: proceso automático diario. Resultado documentado.

### 8.6 Copias de seguridad

- Backup incremental cada hora. Backup completo diario.
- Retención: 30 días en almacenamiento caliente, 1 año en frío, 5 años para documentos firmados.
- Ubicación: servidor primario + réplica en zona geográfica diferente, **ambas dentro de la Unión Europea**.
- Test de restauración completa obligatorio cada 90 días. Resultado documentado y visible en el Panel de Administración.

### 8.7 Gestión de brechas de seguridad

- Monitorización en tiempo real: alertas ante accesos en horario inusual, volumen de descargas elevado, accesos desde IPs no habituales, múltiples FAILED_AUTH.
- Notificación a la AEPD en ≤ 72 horas si la brecha afecta datos personales con riesgo.
- Notificación a los afectados cuando la brecha suponga alto riesgo para sus derechos.
- Registro interno de todas las brechas en el Registro de Violaciones de Seguridad, incluyendo las que no requieren notificación.

### 8.8 EIPD (Evaluación de Impacto en la Protección de Datos)

Obligatoria antes del despliegue en producción (Art. 35.3.b RGPD: tratamiento de datos de categoría especial a escala + personas vulnerables). Debe incluir: descripción del tratamiento, necesidad y proporcionalidad, evaluación de riesgos, medidas de mitigación.

### 8.9 RAT (Registro de Actividades de Tratamiento)

Tratamientos a documentar como mínimo:
- Gestión de expedientes de residentes
- Gestión de incidencias
- Comunicaciones con familiares
- Gestión de empleados del centro
- Comunicaciones con la Administración pública
- Procesamiento por Agentes IA (incluyendo base jurídica y DPA con Anthropic)
- Videovigilancia (si aplica)

---

## 9. Garantías documentales

| # | Garantía | Implementación |
|---|----------|----------------|
| 1 | **Identificación de usuarios** | 2FA + JWT. Toda actuación vinculada al usuario autenticado. |
| 2 | **Firma electrónica** | QTSP para documentos con alto valor probatorio. Hash + TSA para registros operativos. |
| 3 | **Integridad documental** | SHA-256 en el INSERT. Verificación automática diaria de hashes. |
| 4 | **Sello de tiempo** | TSA cualificada externa. Independiente del reloj del servidor. |
| 5 | **Trazabilidad de accesos** | Audit log inmutable con hash encadenado. Quién, qué, cuándo, desde dónde. |
| 6 | **Control de permisos** | RBAC granular por módulo, acción y residente asignado. |
| 7 | **Conservación segura** | AES-256 en columna + KMS. Backups georreplicados en UE. Retención mínima 5 años. |
| 8 | **Protección de datos** | Privacy by design. Pseudonimización ante LLM externo. EIPD previa. RAT actualizado. |
| 9 | **Disponibilidad ante inspección** | Exportación en ≤ 5 minutos. Paquetes firmados verificables sin ResidIA. |

---

## 10. Arquitectura técnica

### 10.1 Decisiones técnicas

| Decisión | Elección | Justificación |
|----------|----------|---------------|
| **Backend** | TypeScript / NestJS (monólito modular) | Equipo full-stack unificado. Módulos con dominio propio aislado. Escalable a microservicios cuando haya >10 centros. |
| **Servicio IA** | Python / FastAPI (microservicio separado) | Ciclo de vida independiente del core. Dependencias distintas (Whisper, pgvector, pseudonimizador). Escala independiente. |
| **Frontend** | Next.js (App Router) + TypeScript | SSR para performance. Un único codebase para todas las interfaces (admin, profesionales, familiares). |
| **Base de datos** | PostgreSQL 16 + pgcrypto + pgvector | Cifrado a nivel de columna nativo. Búsqueda vectorial para el Agente de Seguimiento. Sin introducir dependencias adicionales. |
| **Documentos** | AWS S3 con SSE-KMS | Almacenamiento seguro de PDF/A, audios transcritos, documentos firmados. |
| **Caché / Sesiones** | Redis | Solo para sesiones y caché de permisos. Nunca datos clínicos. |
| **Audit Log** | PostgreSQL append-only con hash encadenado | Inmutabilidad estructural a nivel de BD. Verificable sin sistema externo. |
| **Modelo de tenants** | Schema-per-tenant en PostgreSQL | Aislamiento estructural entre centros. Más fuerte que RLS, más simple que database-per-tenant. Fácil de demostrar a auditores. |
| **LLM** | Claude API (Anthropic) + pseudonimización | Mejor rendimiento en español clínico. Sin datos reales salen de la infraestrutura (pseudonimización previa). DPA disponible. |
| **Colas asíncronas** | BullMQ + Redis | Generación de PDF/A firmados y llamadas al LLM son operaciones lentas (3-15s). No bloquean la UI. |
| **Infraestructura** | AWS eu-west-1 (Irlanda) | Dentro de la UE. Cumplimiento RGPD para transferencias. AWS KMS, Secrets Manager y S3 disponibles de forma nativa. |

### 10.2 Diagrama de componentes

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENTES                                    │
│   Next.js SPA                                   WhatsApp Business   │
│   (Admin · Profesionales · Familiares)          (Agentes IA)        │
└──────────────────────┬──────────────────────────────┬──────────────┘
                       │ HTTPS / TLS 1.3              │ HTTPS / TLS 1.3
┌──────────────────────▼──────────────────────────────▼──────────────┐
│                        API GATEWAY                                  │
│          Autenticación JWT · Rate limiting · Logging                │
└──────┬──────────────────────────────────────────┬───────────────────┘
       │                                          │
┌──────▼────────────────────────────────┐  ┌─────▼────────────────┐
│     CORE (NestJS — monólito modular)  │  │  AGENTES IA (Python  │
│                                       │  │  FastAPI)            │
│  módulo: auth                         │  │                      │
│  módulo: residentes                   │  │  pseudonimizador     │
│  módulo: incidencias                  │  │  whisper (audio)     │
│  módulo: expedientes                  │  │  claude api client   │
│  módulo: pai                          │  │  pgvector client     │
│  módulo: turnos                       │  │  queue consumer      │
│  módulo: familiares                   │  └─────────┬────────────┘
│  módulo: auditoria                    │            │
│  módulo: admin                        │            │
│  módulo: consentimientos              │            │
└──────┬───────────────────┬────────────┘            │
       │                   │                         │
┌──────▼──────┐    ┌───────▼──────────────────────────▼────────┐
│   REDIS     │    │        PostgreSQL (AWS RDS)                │
│  Sesiones   │    │                                            │
│  Caché      │    │  schema: shared (global)                   │
│  BullMQ     │    │  schema: centro_001 (Fundación Ozanam)     │
└─────────────┘    │  schema: centro_002 (próximo cliente)      │
                   │  ...                                        │
                   │  ├── tablas de datos (cifradas)             │
                   │  ├── audit_log (append-only)                │
                   │  └── pgvector (embeddings pseudonimizados)  │
                   └───────────────────────┬────────────────────┘
                                           │
                   ┌───────────────────────▼────────────────────┐
                   │          AWS S3 (eu-west-1)                 │
                   │  Documentos PDF/A · Audios · Backups        │
                   │  SSE-KMS · Retención configurable           │
                   └────────────────────────────────────────────┘
```

### 10.3 Modelo de tenants (schema-per-tenant)

```sql
-- Cada nuevo centro recibe su propio schema
CREATE SCHEMA centro_001;
SET search_path TO centro_001;

-- Todas las tablas del dominio se crean dentro del schema
CREATE TABLE residentes (...);
CREATE TABLE incidencias (...);
-- ...

-- El API Gateway inyecta el schema correcto en cada request
-- tras la autenticación. Ninguna query llega a la BD sin
-- el search_path definido para el centro del usuario autenticado.
```

**Beneficios:**
- Un bug de código que olvide el filtro de tenant no expone datos de otro centro (aislamiento estructural, no lógico).
- Migración de esquema por centro: permite rollouts graduales.
- Eliminar todos los datos de un centro: `DROP SCHEMA centro_X CASCADE`.
- Demostrable a auditores de la AEPD sin explicar código.

### 10.4 Cola asíncrona para operaciones lentas

Las siguientes operaciones **nunca son síncronas** en el request/response del usuario:
- Generación de PDF/A firmado con sello TSA (3-8s)
- Llamadas a Claude API (2-15s)
- Generación de paquetes de auditoría (variable)
- Verificación diaria de integridad del audit log

Flujo:
1. El usuario ejecuta la acción (ej: "Generar PAI").
2. El servidor encola el trabajo en BullMQ y responde inmediatamente con un `job_id`.
3. El frontend muestra estado en tiempo real via Server-Sent Events (SSE).
4. Cuando el trabajo termina, el resultado está disponible y se notifica al usuario.

### 10.5 Integración con servicios externos

| Servicio | Propósito | Requisito previo |
|----------|-----------|-----------------|
| **WhatsApp Business API (Meta)** | Canal de los Agentes IA | DPA firmado. Cuenta Business verificada. |
| **Claude API (Anthropic)** | LLM para los agentes | DPA firmado bajo EU-US DPF. Pseudonimización activa. |
| **TSA Cualificada** | Sellos de tiempo eIDAS | Proveedor en la EU Trusted List. |
| **QTSP** | Firma electrónica cualificada | Para PAI, consentimientos, contratos de ingreso. |
| **AWS KMS** | Gestión de claves de cifrado | FIPS 140-2 Level 2. Claves por centro. |
| **AWS Secrets Manager** | Gestión de secretos | Rotación automática de credenciales. |

### 10.6 Infraestructura y disponibilidad

- **Región:** AWS eu-west-1 (Irlanda). Todos los datos permanecen en la UE.
- **Disponibilidad objetivo:** 99.9% mensual (≤ 8.7 horas de downtime/año).
- **RTO:** ≤ 4 horas. **RPO:** ≤ 1 hora.
- **Escalado:** Core horizontal (ECS/Fargate). Agentes IA escalan independientemente según carga de procesamiento.

### 10.7 CI/CD y pipeline de seguridad

Todo commit a `main` pasa por:
1. Tests unitarios e integración (cobertura mínima 80% en módulos críticos).
2. **SAST** (análisis estático de seguridad): detección de inyección SQL, XSS, secretos en código.
3. **Scan de dependencias** (OWASP Dependency Check): vulnerabilidades conocidas en paquetes.
4. Tests E2E en entorno de staging con datos anonimizados (nunca datos reales).
5. Deploy a staging → validación manual para features críticas → deploy a producción.

Ningún deploy a producción sin pasar los pasos 1-4.

### 10.8 Observabilidad

- **Logs estructurados:** JSON con campos: `timestamp`, `level`, `service`, `centro_id`, `usuario_id`, `accion`, `duracion_ms`, `error`. Sin datos clínicos en logs.
- **Métricas:** tiempo de respuesta por endpoint (p50, p95, p99), tasa de error, jobs en cola, uso de CPU/memoria por servicio.
- **Alertas:** sistema caído, tasa de error > 1% en 5 minutos, cola de jobs con > 100 trabajos pendientes, accesos anómalos (para brechas de seguridad).
- Stack sugerido: CloudWatch (AWS nativo) o Datadog con región EU.

---

## 11. Contratos con terceros (DPA)

Los siguientes contratos deben estar firmados **antes del primer procesamiento de datos en producción**. Su ausencia es una infracción del Art. 28 RGPD.

| Proveedor | Datos que procesa | Contrato requerido | Estado |
|-----------|-------------------|-------------------|--------|
| **Meta (WhatsApp Business API)** | Mensajes de profesionales (pueden contener referencias clínicas) | Contrato de Encargado de Tratamiento (Art. 28 RGPD). Verificar que los términos standard de Meta cubren datos de salud. | Pendiente |
| **Anthropic (Claude API)** | Texto pseudonimizado (sin datos identificativos reales) | DPA bajo EU-US Data Privacy Framework. Anthropic certificado DPF. | Pendiente |
| **AWS** | Todos los datos (infraestructura, S3, KMS, RDS) | AWS Data Processing Addendum (disponible y firmable en la consola AWS). | Pendiente |
| **TSA Cualificada** | Hashes de documentos (no datos personales directos) | Contrato de servicio con cláusulas de confidencialidad. | Pendiente |
| **QTSP** | Documentos a firmar + identidad del firmante | Contrato de Encargado de Tratamiento. | Pendiente |

---

## 12. Estrategia de pruebas

### 12.1 Tests automatizados

| Tipo | Herramienta | Cobertura mínima | Qué verifica |
|------|-------------|-----------------|--------------|
| Unitarios | Jest (TS) / Pytest (Python) | 80% en módulos críticos | Lógica de negocio, reglas de inmutabilidad, cálculo de hashes |
| Integración | Jest + Supertest | Todos los endpoints críticos | Autenticación, RBAC, acceso entre tenants, audit log |
| E2E | Playwright | Flujos completos de usuario | Registro de incidencia, firma de PAI, flujo de consentimiento |
| Seguridad (SAST) | Semgrep / CodeQL | 100% del código | Inyección SQL, XSS, secretos en código |
| Dependencias | OWASP Dependency Check | 100% en cada build | CVEs conocidos en paquetes |

### 12.2 Test crítico de aislamiento de tenants

Antes de cualquier go-live con más de un centro:
- Test automatizado que verifica que un usuario autenticado en `centro_001` no puede acceder a ningún dato de `centro_002`, incluso con manipulación del JWT o de parámetros de la URL.
- Este test es bloqueante: si falla, el deploy no puede proceder.

### 12.3 Prueba de penetración (Pentest)

Obligatoria para la conformidad con ENS categoría MEDIA:
- **Antes del go-live en producción:** pentest externo por empresa certificada (CREST o equivalente).
- **Scope mínimo:** OWASP Top 10, escalado de privilegios entre tenants, acceso no autorizado a datos clínicos, inyección en campos de texto libre, manipulación del audit log.
- **Frecuencia posterior:** anual o tras cambios mayores de arquitectura.
- Los hallazgos críticos y altos deben resolverse antes del go-live. Los medios en el sprint siguiente.

### 12.4 Verificación de integridad del audit log

Proceso automatizado diario que:
1. Recorre la cadena de hashes del audit log desde el primer registro.
2. Verifica que `hash_propio` de cada registro coincide con SHA-256(contenido + hash_anterior).
3. Si detecta una ruptura en la cadena: alerta inmediata a SUPERADMIN y al ADMIN_CENTRO afectado.

---

## 13. Migración de datos históricos

### 13.1 Alcance del piloto

Para la Fundación Federico Ozanam, ResidIA gestiona datos **a partir de la fecha de go-live**. Los registros históricos en papel o en software anterior no se migran automáticamente.

**Justificación:** migrar datos históricos no digitalizados introduce riesgo de error (transcripción, clasificación incorrecta) sin valor jurídico adicional, ya que los registros en papel conservan su validez original. Los registros históricos en software anterior se pueden exportar y adjuntar como documentos escaneados al expediente si el centro lo requiere.

### 13.2 Proceso de onboarding de un nuevo centro

```
1. Engrene provisionea el schema en PostgreSQL
   → Script automatizado: CREATE SCHEMA centro_XXX + migrations

2. ADMIN_CENTRO crea los usuarios del centro (importación CSV disponible)

3. Trabajador social / ADMIN_CENTRO registra los residentes activos
   (formulario de alta con campos obligatorios)

4. Flujo de consentimiento para cada residente activo
   (presencial o enlace seguro)

5. Verificación: todos los residentes activos tienen consentimiento ACTIVO
   antes de habilitar el acceso clínico

6. Formación del personal (sesión de 2 horas, material en video)

7. Go-live supervisado: primera semana con soporte Engrene dedicado
```

### 13.3 Migración desde software anterior (si aplica)

Si el centro tiene datos estructurados en otro software (DomusVI, Geriaware, Gero, etc.):
- Se solicita exportación en CSV o XML al proveedor actual.
- Engrene mapea los campos al modelo de datos de ResidIA.
- Los datos importados se marcan con `origen: MIGRADO` y no reciben sello de tiempo TSA (no se puede certificar retroactivamente).
- El centro firma un documento de validación de la migración.

---

## 14. Roadmap de implementación

### Fase 1 — Fundamentos (semanas 1-16)

| Semana | Entregable |
|--------|-----------|
| 1-2 | Briefing con el centro. Levantamiento de procesos actuales. Firma de contratos (DPA con Meta, Anthropic, AWS). |
| 3-4 | Provisioning de infraestructura AWS eu-west-1. Schema inicial. Pipeline CI/CD. Gestión de secretos. |
| 5-6 | Auth + RBAC + Audit Log inmutable con hash encadenado. |
| 7-8 | Flujo de consentimientos RGPD completo. Alta de residentes. |
| 9-12 | Libro de Incidencias Digital + Agente de Registro Unificado (WhatsApp). |
| 13-14 | Agente de Comunicación con Familias. Portal de Familiares (versión básica). |
| 15 | Pentest externo de la Fase 1. Resolución de hallazgos. |
| 16 | Formación del personal. Go-live supervisado Fase 1. |

### Fase 2 — Operaciones (semanas 17-28)

| Semana | Entregable |
|--------|-----------|
| 17-20 | Expediente del Residente completo. Gestión de Turnos. |
| 21-24 | Módulo PAI + Agente de Automatización PAI (con aviso legal y audit trail). |
| 25-28 | Agente de Seguimiento Inteligente (pgvector + búsqueda semántica). |

### Fase 3 — Cumplimiento y Calidad (semanas 29-36)

| Semana | Entregable |
|--------|-----------|
| 29-31 | Módulo de Auditoría e Inspección. Integración QTSP y TSA cualificada. |
| 32-33 | EIPD formal. RAT completo documentado en el sistema. Política de seguridad ENS. |
| 34-35 | Pentest completo del sistema. Simulacro de inspección de la Administración aragonesa. |
| 36 | Documentación legal completa. Certificación de conformidad. |

### Fase 4 — Escalabilidad (a partir de semana 37)

- BI clínico y operativo (dashboards analíticos).
- Portal de familiares avanzado.
- Onboarding de nuevos centros (proceso automatizado).
- Adaptación a normativa de otras comunidades autónomas.
- Evaluación de SLA enterprise para centros grandes.

---

## 15. KPIs del producto

Estos indicadores miden si el producto está funcionando, no solo si está desplegado.

| KPI | Cómo se mide | Objetivo Fase 1 |
|-----|--------------|-----------------|
| **Adopción del Agente de Registro** | % incidencias registradas vía WhatsApp vs. interfaz web | > 60% a los 30 días del go-live |
| **Tiempo de registro de incidencia** | Duración entre inicio de mensaje y confirmación de registro | < 2 minutos (benchmark papel: ~8 min) |
| **Tasa de corrección de borradores IA** | % de borradores en los que el profesional corrige al menos un campo | Objetivo < 15% (indica calidad del modelo) |
| **Tiempo de respuesta a familiares** | Tiempo entre mensaje del familiar y primera respuesta del Agente | < 30 segundos |
| **Incidencias sin resolución** | Nº de incidencias con `accion_requerida = true` abiertas > 48h | 0 en situación normal |
| **PAI sin revisar** | Nº de residentes con PAI > 6 meses sin actualizar | 0 (sistema genera alertas) |
| **Disponibilidad del sistema** | Uptime mensual medido externamente | > 99.9% |
| **Tiempo de exportación para inspección** | Desde solicitud hasta entrega del paquete firmado | < 5 minutos |

---

## 16. Requisitos no funcionales

| Requisito | Especificación |
|-----------|---------------|
| **Idioma** | Español exclusivamente en todas las interfaces, documentos, notificaciones, mensajes de error y contenido del sistema. Sin inglés ni portugués. |
| **Rendimiento** | API ≤ 500ms (p95) en operaciones de lectura. Operaciones asíncronas (PDF/A, LLM) notificadas vía SSE sin bloquear la UI. |
| **Compatibilidad** | Últimas 2 versiones de Chrome, Firefox, Edge, Safari. Responsive para tablets (uso en planta por auxiliares). |
| **Accesibilidad** | WCAG 2.1 nivel AA. |
| **Offline parcial** | Auxiliares en planta pueden registrar incidencias básicas sin conexión. Sincronización automática al recuperar conectividad. Cola local en IndexedDB con resolución de conflictos FIFO. |
| **Exportación** | PDF/A para documentos firmados. CSV/Excel para datos tabulares. JSON/XML para datos estructurados (ENI). |
| **SLA de soporte** | P1 (sistema caído) ≤ 2h · P2 (función crítica degradada) ≤ 8h · P3 (resto) ≤ 48h. |
| **Retención de datos** | Residentes: mínimo 5 años tras baja. Historia clínica relevante: 15 años. Audit log: 5 años. |

---

## 17. Plan de contingencia offline

Si el sistema está completamente inaccesible durante un turno:

1. El centro descarga (o imprime preventivamente) el **Formulario de Incidencia de Emergencia** (PDF disponible en el panel de admin).
2. El profesional registra la incidencia en papel con todos los campos del Libro de Incidencias.
3. Cuando el sistema se restaura, el COORDINADOR o ADMIN_CENTRO introduce los registros en papel con la fecha y hora real del evento (no la de la introducción), indicando `origen: CONTINGENCIA_OFFLINE`.
4. Estos registros se marcan visualmente en el sistema y en cualquier exportación como introducidos en diferido, con la identificación del profesional que los introdujo.
5. El SLA P1 (sistema caído) garantiza restauración en ≤ 2 horas.

---

## 18. Glosario

| Término | Definición |
|---------|------------|
| **AEPD** | Agencia Española de Protección de Datos |
| **Audit Log** | Registro cronológico, inmutable y encadenado por hashes de todas las acciones del sistema |
| **DPA** | Data Processing Agreement — Contrato de Encargado de Tratamiento (Art. 28 RGPD) |
| **DPF** | EU-US Data Privacy Framework — marco que regula transferencias de datos UE-EUA |
| **DPO** | Delegado de Protección de Datos |
| **EIPD** | Evaluación de Impacto en la Protección de Datos (Art. 35 RGPD) |
| **eIDAS** | Reglamento UE sobre identificación electrónica y servicios de confianza (UE 910/2014) |
| **ENI** | Esquema Nacional de Interoperabilidad (RD 4/2010) |
| **ENS** | Esquema Nacional de Seguridad (RD 311/2022) |
| **LOPDGDD** | Ley Orgánica 3/2018 de Protección de Datos y Garantía de los Derechos Digitales |
| **PAI** | Plan de Atención Individualizada |
| **pgvector** | Extensión de PostgreSQL para almacenamiento y búsqueda de vectores semánticos |
| **Pseudonimización** | Sustitución de datos identificativos por tokens antes de enviar datos al LLM externo |
| **QTSP** | Prestador Cualificado de Servicios de Confianza (eIDAS) |
| **RAG** | Retrieval-Augmented Generation — técnica de contexto para LLMs mediante búsqueda vectorial |
| **RAT** | Registro de Actividades de Tratamiento (Art. 30 RGPD) |
| **RBAC** | Control de acceso basado en roles |
| **RGPD** | Reglamento General de Protección de Datos (UE 2016/679) |
| **Residente** | Persona usuaria del centro sociosanitario |
| **Schema-per-tenant** | Estrategia de aislamiento de datos donde cada centro tiene su propio schema en PostgreSQL |
| **SSE** | Server-Sent Events — mecanismo de notificación en tiempo real del servidor al cliente |
| **TSA** | Autoridad de Sellado de Tiempo (Time Stamping Authority) cualificada |

---

> **Próximo paso:** Incorporar UX/UI. Una vez entregadas las pantallas, se añadirán a esta spec las secciones de diseño de interfaz, flujos de navegación por perfil y componentes de diseño, sin modificar ninguna decisión técnica o legal ya tomada.

*ResidIA — Digitalización con garantías para residencias · Engrene · residia.es*
