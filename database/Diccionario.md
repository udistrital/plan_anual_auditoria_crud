# DICCIONARIO DE DATOS - PLAN_ANUAL_AUDITORIA_CRUD

## Información General

Título: Diccionario de Datos - PLAN_ANUAL_AUDITORIA_CRUD
Base de Datos: MongoDB
ODM: Mongoose
Framework: NestJS
Versión: 1.0
Fecha: 2026-03-19

---

## Colecciones

### plan_auditoria

Plan maestro de auditoría que define objetivos, alcance, criterios y recursos.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| _id | ObjectId | Sí | Identificador único |
| objetivo | String | No | Objetivo general del plan |
| alcance | String | No | Alcance y límites |
| criterio | String | No | Criterios de evaluación |
| recurso | String | No | Descripción de recursos |
| creado_por_id | Number | No | ID del usuario creador |
| vigencia_id | Number | Sí | Año fiscal (OBLIGATORIO) |
| aprobado_jefe_dependencia | Boolean | No | Indicador de aprobación |
| jefe_dependencia_id | Number | No | ID del jefe que aprobó |
| aprobado_secretario_tecnico | Boolean | No | Indicador de aprobación |
| secretario_tecnico_id | Number | No | ID del secretario que aprobó |
| auditorias | Array[ObjectId] | No | Referencias a auditoria_padre |
| activo | Boolean | No | Indicador de estado activo |
| fecha_creacion | Date | No | Fecha de creación |
| fecha_modificacion | Date | No | Fecha de última actualización |

Relaciones: 1:N plan_estado, 1:N auditoria_padre, 1:N documento

---

### plan_estado

Historial de estados de cada plan de auditoría.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| _id | ObjectId | Sí | Identificador único |
| plan_auditoria_id | ObjectId | No | Referencia a plan_auditoria |
| usuario_id | Number | No | ID del usuario que cambió estado |
| usuario_rol | String | No | Rol del usuario |
| observacion | String | No | Comentarios |
| actual | Boolean | No | Indicador de estado actual |
| estado_id | Number | No | ID del estado |

Campo paramétrico: estado_id.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| fecha_ejecucion_estado | Date | No | Fecha de ejecución del cambio |
| activo | Boolean | No | Indicador de estado activo |

Relaciones: N:1 plan_auditoria

---

### auditoria_padre

Auditoría padre que contiene múltiples auditorías hijas.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| _id | ObjectId | Sí | Identificador único |
| plan_auditoria_id | ObjectId | No | Referencia a plan_auditoria |
| titulo | String | No | Título de la auditoría |
| tipo_evaluacion_id | Number | No | Tipo de evaluación |

Campo paramétrico: tipo_evaluacion_id.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| cronograma_id | Array[Number] | No | IDs de cronogramas |

Campo paramétrico: cronograma_id.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| estado_id | Number | No | Estado actual |

Campo paramétrico: estado_id.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| vigencia_id | Number | No | Año fiscal |

Campo paramétrico: vigencia_id.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| macroproceso_id | Array[Number] | No | ID del macroproceso |

Campo paramétrico: macroproceso_id.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| proceso_id | Array[Number] | No | ID del proceso |

Campo paramétrico: proceso_id.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| dependencia_id | Array[Number] | No | ID de la dependencia |

Campo paramétrico: dependencia_id.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| cantidad_auditorias | Number | No | Número de auditorías hijas |
| activo | Boolean | No | Indicador de estado activo |
| fecha_creacion | Date | No | Fecha de creación |
| fecha_modificacion | Date | No | Fecha de última actualización |

Relaciones: N:1 plan_auditoria, 1:N auditoria_padre_estado, 1:N auditoria

---

### auditoria_padre_estado

Historial de estados de auditorías padre.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| _id | ObjectId | Sí | Identificador único |
| auditoria_padre_id | ObjectId | No | Referencia a auditoria_padre |
| usuario_id | Number | No | ID del usuario |
| usuario_rol | String | No | Rol del usuario |
| observacion | String | No | Comentarios |
| actual | Boolean | No | Indicador de estado actual |
| estado_id | Number | No | ID del estado |

Campo paramétrico: estado_id.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| fase_id | String | No | Identificador de la fase | #No esta en Modelo

Campo paramétrico: fase_id.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| fecha_ejecucion_estado | Date | No | Fecha de ejecución |
| activo | Boolean | No | Indicador de estado activo |

Relaciones: N:1 auditoria_padre

---

### auditoria

Auditoría individual con detalles específicos de ejecución.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| _id | ObjectId | Sí | Identificador único |
| plan_auditoria_id | ObjectId | No | Referencia a plan_auditoria |
| auditoria_padre_id | ObjectId | No | Referencia a auditoria_padre |
| cronograma_id | Array[Number] | No | IDs de cronogramas |

Campo paramétrico: cronograma_id.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| estado_id | Number | No | Estado actual |

Campo paramétrico: estado_id.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| consecutivo_no_auditoria | Number | No | Número secuencial |
| vigencia_id | Number | Sí | Año fiscal (OBLIGATORIO) |

Campo paramétrico: vigencia_id.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| consecutivo_OCI | String | No | Número OCI |
| consecutivo_IE | String | No | Número IE |
| subtitulo | String | No | Subtítulo de la auditoría |
| fecha_inicio | Date | No | Inicio de auditoría |
| fecha_fin | Date | No | Fin de auditoría |
| objetivo | String | No | Objetivos específicos |
| alcance | String | No | Alcance específico |
| criterio | String | No | Criterios de evaluación |
| rec_tecnologico | String | No | Recursos tecnológicos |
| rec_humano | String | No | Recursos humanos |
| rec_fisico | String | No | Recursos físicos |
| tema | String | No | Tema principal |
| correo_complementario | Array[Object] | No | Correo adicional |
| activo | Boolean | No | Indicador de estado activo |
| fecha_creacion | Date | No | Fecha de creación |
| fecha_modificacion | Date | No | Fecha de última actualización |

Relaciones: N:1 plan_auditoria, N:1 auditoria_padre, 1:N auditoria_estado, 1:N auditoria_auditor, 1:N actividad, 1:N informe, 1:N documento

---

### auditoria_estado

Historial de estados de auditorías individuales.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| _id | ObjectId | Sí | Identificador único |
| auditoria_id | ObjectId | No | Referencia a auditoria |
| usuario_id | Number | No | ID del usuario |
| usuario_rol | String | No | Rol del usuario |
| observacion | String | No | Comentarios |
| actual | Boolean | No | Indicador de estado actual |
| estado_id | Number | No | ID del estado |

Campo paramétrico: estado_id.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| fase_id | String | No | Identificador de la fase |

Campo paramétrico: fase_id.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| fecha_ejecucion_estado | Date | No | Fecha de ejecución |
| activo | Boolean | No | Indicador de estado activo |

Relaciones: N:1 auditoria

---

### auditoria_auditor

Asignación de auditores a auditorías.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| _id | ObjectId | Sí | Identificador único |
| auditoria_id | ObjectId | Sí | Referencia a auditoria (OBLIGATORIO) |
| auditor_id | Number | Sí | ID del auditor (OBLIGATORIO) |
| asignado | Boolean | Sí | Indicador de asignación (Default: true) (OBLIGATORIO) |
| asignado_por_id | Number | Sí | ID de quién asignó (OBLIGATORIO) |
| auditor_lider | Boolean | Sí | Indicador de auditor líder (OBLIGATORIO) |
| activo | Boolean | No | Indicador de estado activo |
| fecha_creacion | Date | No | Fecha de creación |
| fecha_modificacion | Date | No | Fecha de última actualización |

Relaciones: N:1 auditoria

---

### actividad

Actividades realizadas durante la ejecución de auditoría.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| _id | ObjectId | Sí | Identificador único |
| auditoria_id | ObjectId | No | Referencia a auditoria |
| titulo | String | No | Título de la actividad |
| fecha_inicio | Date | No | Inicio de la actividad |
| fecha_fin | Date | No | Fin de la actividad |
| referencia | String | No | Código o referencia |
| descripcion | String | No | Descripción detallada |
| observacion | String | No | Observaciones |
| folio | Number | No | Número de folio |
| medio | String | No | Nombre del medio utilizado |
| carpeta | String | No | Ruta de almacenamiento |
| completada | Boolean | No | Indicador de actividad completada |
| activo | Boolean | No | Indicador de estado activo |
| fecha_creacion | Date | No | Fecha de creación |
| fecha_modificacion | Date | No | Fecha de última actualización |

Relaciones: N:1 auditoria

---

### informe

Informe final de auditoría con hallazgos y conclusiones.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| _id | ObjectId | Sí | Identificador único |
| auditoria_id | ObjectId | Sí | Referencia a auditoria (OBLIGATORIO) |
| fecha_emision | Date | Sí | Fecha de emisión (OBLIGATORIO) |
| muestra | String | No | Descripción de la muestra |
| aspecto_general | String | No | Aspectos generales |
| respuesta_preliminar | String | No | Respuesta preliminar |
| informe_final | String | No | Contenido del informe |
| observacion_conclusion | String | No | Observaciones y conclusiones |
| nota | String | No | Notas adicionales |
| preliminar_auditor_id | Number | No | ID auditor firma preliminar |
| final_auditor_id | Number | No | ID auditor firma final |
| preliminar_auditado_id | Number | No | ID auditado que respondió |
| activo | Boolean | No | Indicador de estado activo |
| fecha_creacion | Date | No | Timestamp de creación |
| fecha_modificacion | Date | No | Timestamp de actualización |

Relaciones: N:1 auditoria, 1:N tema

---

### tema

Tema principal del informe con estructura jerárquica.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| _id | ObjectId | Sí | Identificador único |
| informe_id | ObjectId | Sí | Referencia a informe (OBLIGATORIO) |
| titulo | String | Sí | Título del tema (OBLIGATORIO) |
| activo | Boolean | No | Indicador de estado activo |
| subtema | Array[Object] | No | Array de subtemas anidados |
| fecha_creacion | Date | No | Timestamp de creación |
| fecha_modificacion | Date | No | Timestamp de actualización |

Subestructura: subtema

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| _id | ObjectId | Sí | Identificador único |
| tema_id | ObjectId | Sí | Referencia a tema (OBLIGATORIO) |
| titulo | String | Sí | Título del subtema (OBLIGATORIO) |
| activo | Boolean | No | Indicador de estado activo |
| hallazgo | Array[Object] | No | Array de hallazgos anidados |
| fecha_creacion | Date | No | Timestamp de creación |
| fecha_modificacion | Date | No | Timestamp de actualización |

Subestructura: hallazgo

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| _id | ObjectId | Sí | Identificador único |
| subtema_id | ObjectId | Sí | Referencia a subtema (OBLIGATORIO) |
| titulo | String | Sí | Título del hallazgo (OBLIGATORIO) |
| criterio | String | Sí | Criterio evaluado (OBLIGATORIO) |
| descripcion | String | Sí | Descripción detallada (OBLIGATORIO) |
| activo | Boolean | No | Indicador de estado activo |
| fecha_creacion | Date | No | Timestamp de creación |
| fecha_modificacion | Date | No | Timestamp de actualización |

Relaciones: N:1 informe, estructura anidada tema-subtema-hallazgo

---

### documento

Referencias a documentos en sistema externo (Nuxeo).

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| _id | ObjectId | Sí | Identificador único |
| referencia_id | ObjectId | Sí | ID del documento referenciado (OBLIGATORIO) |
| referencia_tipo | String | Sí | Tipo de referencia (OBLIGATORIO) |

Campo paramétrico: referencia_tipo.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| nuxeo_id | Number | Sí | ID en Nuxeo (OBLIGATORIO) |
| nuxeo_enlace | String | Sí | URL en Nuxeo (OBLIGATORIO) |
| tipo_id | Number | Sí | ID del tipo de documento (OBLIGATORIO) |

Campo paramétrico: tipo_id.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| activo | Boolean | Sí | Indicador de estado activo (Default: true) (OBLIGATORIO) |
| fecha_creacion | Date | Sí | Fecha de creación (OBLIGATORIO) |
| fecha_modificacion | Date | No | Timestamp de actualización |

Relaciones: N:1 auditoria, N:1 plan_auditoria (según referencia_tipo)

---

### notificacion

Registro de notificaciones enviadas (correos) a usuarios.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| _id | ObjectId | Sí | Identificador único |
| plantilla | String | No | Nombre de plantilla de correo |
| fecha_envio | Date | No | Fecha de envío |
| metadato | Object | No | Metadatos del evento |
| referencia_id | ObjectId | No | ID del documento referenciado |
| referencia_tipo | String | Sí | Tipo de referencia (OBLIGATORIO) |

Campo paramétrico: referencia_tipo.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| activo | Boolean | No | Indicador de estado activo |
| fecha_creacion | Date | No | Fecha de creación |
| fecha_modificacion | Date | No | Fecha de última actualización |

Relaciones: N:1 plan_auditoria, N:1 auditoria (según referencia_tipo)

---

## Relaciones

plan_auditoria (1) → plan_estado (N)
plan_auditoria (1) → auditoria_padre (N)
plan_auditoria (1) → documento (N)

auditoria_padre (1) → auditoria_padre_estado (N)
auditoria_padre (1) → auditoria (N)

auditoria (1) → auditoria_estado (N)
auditoria (1) → auditoria_auditor (N)
auditoria (1) → actividad (N)
auditoria (1) → informe (N)
auditoria (1) → documento (N)

informe (1) → tema (N)
tema (1) → subtema (N) [anidado]
subtema (1) → hallazgo (N) [anidado]

---
