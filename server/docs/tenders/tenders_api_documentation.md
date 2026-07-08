# Documentación de API - Licitaciones (Tenders)

## Estructuras de Respuesta Estándar

### Respuesta Exitosa (`success: true`)
Todos los endpoints exitosos retornan una estructura JSON uniforme:
```json
{
  "success": true,
  "message": "Mensaje descriptivo del resultado",
  "code": "CODIGO_DE_OPERACION",
  "data": null // Opcional, información detallada del resultado
}
```

### Respuesta de Error (`success: false` / `AppError`)
Los errores de negocio controlados y los errores internos del servidor se formatean de la siguiente manera:
```json
{
  "success": false,
  "message": "Mensaje de error comprensible para el cliente",
  "code": "CODIGO_DE_ERROR",
  "details": null // Opcional, información adicional del error
}
```

---

## 1. Crear Licitación

Crea una nueva licitación en estado borrador (`DRAFT`) o activa/pendiente (`PENDING`), asociándole un cronograma (cronograma de hitos), requisitos y subiendo los archivos de bases o documentos adjuntos.

* **Endpoint**: `/api/v1/tenders/create-tender`
* **Método**: `POST`
* **Autenticación/Autorización**: Requiere cookies `token` y `refreshToken` activas. El usuario debe tener el rol `MUNICIPAL_EVALUATOR`.
* **¿Qué pide y cómo lo pide?**:
  * Enviado implícitamente en las **Cookies del navegador**:
    * `token` y `refreshToken` (requeridas).
  * Enviado en el **cuerpo (`Body`) como `multipart/form-data`**:
    * `action`: `"SEND"` o `"DRAFT"`.
    * `title`: Título de la licitación.
    * `location`: Ubicación geográfica o dirección.
    * `coorX`: Coordenada X (numérica, longitud).
    * `coorY`: Coordenada Y (numérica, latitud).
    * `description`: Descripción de la licitación.
    * `executionPeriod`: Periodo de ejecución.
    * `contact`: Datos de contacto.
    * `municipality`: Municipio asociado.
    * `tenderSchedule`: Arreglo de hitos del cronograma.
      ```json
      [
        {
          "schedule": "CALL_FOR_APPLICATIONS", // O "PARTICIPANT_REGISTRATION", "SUBMISSION_OF_PROPOSALS", "AWARD_OF_TENDER"
          "scheduleTimeLine": "Fecha o descripción"
        }
      ]
      ```
    * `requirements`: Arreglo de requisitos de postulación.
      ```json
      [
        {
          "requirement": "Nombre del requisito",
          "validationSchema": {
            "minValue": 10,
            "maxValue": 100,
            "minLength": 5,
            "maxLength": 50,
            "pattern": "^[a-zA-Z]+$"
          }
        }
      ]
      ```
    * `documents`: Arreglo describiendo los metadatos de los archivos adjuntos.
      ```json
      [
        {
          "documentType": "Tipo de documento (p. ej. bases)",
          "fileName": "nombre_archivo.pdf"
        }
      ]
      ```
  * Archivos subidos en el campo **`documents`**:
    * Hasta 10 archivos físicos como archivos adjuntos (con nombres coincidentes con los de la propiedad `fileName` de los metadatos `documents`).

* **Respuestas Posibles**:
  * **`201 Created`** (Éxito):
    ```json
    {
      "success": true,
      "message": "Licitación creada exitosamente",
      "code": "TENDER_CREATED"
    }
    ```
  * **`400 Bad Request`** (Errores de Zod o archivos faltantes):
    * Si la validación de Zod falla (p. ej., campos obligatorios faltantes o con formato inválido):
      ```json
      {
        "success": false,
        "message": "Detalle del error de validación",
        "code": "VALIDATION_ERROR"
      }
      ```
    * Si no se suben archivos físicos en la petición:
      ```json
      {
        "success": false,
        "message": "No se han subido archivos",
        "code": "NO_FILES_UPLOADED"
      }
      ```
    * Si un archivo descrito en los metadatos `documents` no se encuentra entre los archivos físicos subidos:
      ```json
      {
        "success": false,
        "message": "Archivo no encontrado: nombre_archivo.pdf",
        "code": "FILE_NOT_FOUND"
      }
      ```
  * **`401 Unauthorized`** (Token inválido o expirado):
    ```json
    {
      "success": false,
      "message": "Token inválido",
      "code": "TOKEN_INVALID"
    }
    ```
  * **`403 Forbidden`** (Rol no autorizado):
    ```json
    {
      "success": false,
      "message": "Usuario no autorizado",
      "code": "USER_NOT_AUTHORIZED"
    }
    ```
  * **`404 Not Found`** (Recurso no encontrado):
    * Si el usuario no existe:
      ```json
      {
        "success": false,
        "message": "Usuario no encontrado",
        "code": "USER_NOT_FOUND"
      }
      ```
    * Si el perfil de evaluador no existe:
      ```json
      {
        "success": false,
        "message": "Perfil de usuario no encontrado",
        "code": "PROFILE_NOT_FOUND"
      }
      ```
    * Si la municipalidad no existe:
      ```json
      {
        "success": false,
        "message": "Municipio no encontrado",
        "code": "MUNICIPALITY_NOT_FOUND"
      }
      ```
  * **`409 Conflict`** (Cuenta inactiva):
    ```json
    {
      "success": false,
      "message": "Cuenta inactiva",
      "code": "ACCOUNT_NOT_ACTIVE"
    }
    ```
  * **`500 Internal Server Error`**:
    ```json
    {
      "success": false,
      "message": "Error al crear la licitación, ...",
      "code": "ERROR_CREATING_TENDER"
    }
    ```

---

## 2. Actualizar Licitación

Actualiza la información básica, cronogramas y requisitos de una licitación. Para actualizar hilos de cronograma o requisitos específicos, se deben pasar sus correspondientes identificadores (`idSchedule` / `idRequirement`).

* **Endpoint**: `/api/v1/tenders/update-tender/:id`
* **Método**: `PUT`
* **Autenticación/Autorización**: Requiere cookies `token` y `refreshToken` activas. El usuario debe tener el rol `MUNICIPAL_EVALUATOR` y ser el creador de la licitación.
* **Parámetro de Ruta (`Params`)**:
  * `id`: UUID de la licitación a actualizar (debe estar en estado `DRAFT` o `REJECTED`).
* **¿Qué pide y cómo lo pide?**:
  * Enviado implícitamente en las **Cookies del navegador**:
    * `token` y `refreshToken` (requeridas).
  * Enviado en el **cuerpo (`Body`) como JSON (`application/json`)**:
    * `title` (opcional): Título actualizado de la licitación.
    * `location` (opcional): Ubicación física o dirección actualizada.
    * `coorX` (opcional): Coordenada X (numérica).
    * `coorY` (opcional): Coordenada Y (numérica).
    * `description` (opcional): Descripción actualizada.
    * `executionPeriod` (opcional): Período de ejecución actualizado.
    * `contact` (opcional): Datos de contacto actualizados.
    * `municipality` (opcional): Municipio asociado actualizado.
    * `tenderSchedule` (opcional): Arreglo de hitos del cronograma.
      ```json
      [
        {
          "idSchedule": "UUID_DEL_HITO", // Opcional, requerido para actualizar un hito existente
          "schedule": "CALL_FOR_APPLICATIONS", // O "PARTICIPANT_REGISTRATION", "SUBMISSION_OF_PROPOSALS", "AWARD_OF_TENDER" (opcional)
          "scheduleTimeLine": "Fecha o descripción" // Opcional
        }
      ]
      ```
    * `requirements` (opcional): Arreglo de requisitos de postulación.
      ```json
      [
        {
          "idRequirement": "UUID_DEL_REQUISITO", // Opcional, requerido para actualizar un requisito existente
          "requirement": "Nombre del requisito", // Opcional
          "validationSchema": { // Opcional
            "minValue": 10,
            "maxValue": 100,
            "minLength": 5,
            "maxLength": 50,
            "pattern": "^[a-zA-Z]+$"
          }
        }
      ]
      ```

* **Respuestas Posibles**:
  * **`201 Created`** (Éxito):
    ```json
    {
      "success": true,
      "message": "Licitación actualizada exitosamente",
      "code": "TENDER_UPDATED"
    }
    ```
  * **`400 Bad Request`** (Errores de validación):
    ```json
    {
      "success": false,
      "message": "Detalle del error de validación",
      "code": "VALIDATION_ERROR"
    }
    ```
  * **`403 Forbidden`** (Usuario no autorizado):
    ```json
    {
      "success": false,
      "message": "Usuario no autorizado",
      "code": "USER_NOT_AUTHORIZED"
    }
    ```
  * **`404 Not Found`** (Recursos no encontrados):
    * Si la licitación no existe o no se encuentra en estado `DRAFT` o `REJECTED`:
      ```json
      {
        "success": false,
        "message": "Licitación no encontrada",
        "code": "TENDER_NOT_FOUND"
      }
      ```
    * Si un cronograma especificado por `idSchedule` no existe:
      ```json
      {
        "success": false,
        "message": "Cronograma no encontrado",
        "code": "SCHEDULE_NOT_FOUND"
      }
      ```
    * Si un requisito especificado por `idRequirement` no existe:
      ```json
      {
        "success": false,
        "message": "Requisito no encontrado",
        "code": "REQUIREMENT_NOT_FOUND"
      }
      ```

---

## 3. Eliminar Archivo de Licitación

Elimina físicamente un archivo adjunto y su correspondiente registro de base de datos asociado a una licitación en estado borrador o rechazada.

* **Endpoint**: `/api/v1/tenders/delete-file-tender/:id`
* **Método**: `DELETE`
* **Autenticación/Autorización**: Requiere cookies `token` y `refreshToken` activas. El usuario debe tener el rol `MUNICIPAL_EVALUATOR` y ser el creador de la licitación asociada al archivo.
* **Parámetro de Ruta (`Params`)**:
  * `id`: UUID del archivo (documento) a eliminar.
* **Respuestas Posibles**:
  * **`201 Created`** (Éxito):
    ```json
    {
      "success": true,
      "message": "Archivo eliminado exitosamente",
      "code": "FILE_DELETED"
    }
    ```
  * **`403 Forbidden`** (Usuario no autorizado):
    ```json
    {
      "success": false,
      "message": "Usuario no autorizado",
      "code": "USER_NOT_AUTHORIZED"
    }
    ```
  * **`404 Not Found`**:
    * Si el usuario no existe:
      ```json
      {
        "success": false,
        "message": "Usuario no encontrado",
        "code": "USER_NOT_FOUND"
      }
      ```
    * Si el archivo no existe:
      ```json
      {
        "success": false,
        "message": "Archivo no encontrado",
        "code": "FILE_NOT_FOUND"
      }
      ```
    * Si la licitación asociada al archivo no existe o no se encuentra en estado `DRAFT` o `REJECTED`:
      ```json
      {
        "success": false,
        "message": "Licitación no encontrada",
        "code": "TENDER_NOT_FOUND"
      }
      ```
  * **`409 Conflict`** (Cuenta inactiva):
    ```json
    {
      "success": false,
      "message": "Cuenta inactiva",
      "code": "ACCOUNT_NOT_ACTIVE"
    }
    ```
  * **`500 Internal Server Error`** (Error al borrar archivo):
    ```json
    {
      "success": false,
      "message": "Error al eliminar el archivo, ...",
      "code": "ERROR_DELETING_FILE"
    }
    ```

---

## 4. Agregar Archivo a Licitación

Sube un archivo individual nuevo a una licitación en estado borrador o rechazada.

* **Endpoint**: `/api/v1/tenders/add-file-tender/:id`
* **Método**: `POST`
* **Autenticación/Autorización**: Requiere cookies `token` y `refreshToken` activas. El usuario debe tener el rol `MUNICIPAL_EVALUATOR` y ser el creador de la licitación.
* **Parámetro de Ruta (`Params`)**:
  * `id`: UUID de la licitación a la que se le añadirá el archivo.
* **¿Qué pide y cómo lo pide?**:
  * Enviado implícitamente en las **Cookies del navegador**:
    * `token` y `refreshToken` (requeridas).
  * Enviado en el **cuerpo (`Body`) como `multipart/form-data`**:
    * Archivo físico subido en el campo **`documents`** (único archivo).
* **Respuestas Posibles**:
  * **`201 Created`** (Éxito):
    ```json
    {
      "success": true,
      "message": "Archivo agregado exitosamente",
      "code": "FILE_ADDED"
    }
    ```
  * **`400 Bad Request`** (Errores de archivo):
    * Si no se subió ningún archivo:
      ```json
      {
        "success": false,
        "message": "No se ha subido ningun archivo",
        "code": "NO_FILE_UPLOADED"
      }
      ```
    * Si no se reconoció el tipo de archivo:
      ```json
      {
        "success": false,
        "message": "Tipo de archivo no reconocido",
        "code": "FILE_TYPE_NOT_RECOGNIZED"
      }
      ```
  * **`403 Forbidden`** (Usuario no autorizado):
    ```json
    {
      "success": false,
      "message": "Usuario no autorizado",
      "code": "USER_NOT_AUTHORIZED"
    }
    ```
  * **`404 Not Found`**:
    * Si el usuario no existe:
      ```json
      {
        "success": false,
        "message": "Usuario no encontrado",
        "code": "USER_NOT_FOUND"
      }
      ```
    * Si la licitación no existe o no se encuentra en estado `DRAFT` o `REJECTED`:
      ```json
      {
        "success": false,
        "message": "Licitación no encontrada",
        "code": "TENDER_NOT_FOUND"
      }
      ```
  * **`409 Conflict`** (Cuenta inactiva):
    ```json
    {
      "success": false,
      "message": "Cuenta inactiva",
      "code": "ACCOUNT_NOT_ACTIVE"
    }
    ```
  * **`500 Internal Server Error`** (Error al subir archivo):
    ```json
    {
      "success": false,
      "message": "Error al agregar el archivo, ...",
      "code": "ERROR_ADDING_FILE"
    }
    ```

---

## 5. Archivar/Eliminar Licitación

Realiza un borrado lógico (actualizando el estado a `ARCHIVED`) de una licitación.

* **Endpoint**: `/api/v1/tenders/delete-tender/:id`
* **Método**: `PATCH`
* **Autenticación/Autorización**: Requiere cookies `token` y `refreshToken` activas. El usuario debe tener el rol `MUNICIPAL_EVALUATOR` y ser el creador de la licitación.
* **Parámetro de Ruta (`Params`)**:
  * `id`: UUID de la licitación a archivar.
* **Respuestas Posibles**:
  * **`201 Created`** (Éxito):
    ```json
    {
      "success": true,
      "message": "Licitación archivada exitosamente",
      "code": "TENDER_ARCHIVED"
    }
    ```
  * **`403 Forbidden`** (Usuario no autorizado):
    ```json
    {
      "success": false,
      "message": "Usuario no autorizado",
      "code": "USER_NOT_AUTHORIZED"
    }
    ```
  * **`404 Not Found`**:
    * Si el usuario no existe:
      ```json
      {
        "success": false,
        "message": "Usuario no encontrado",
        "code": "USER_NOT_FOUND"
      }
      ```
    * Si la licitación no existe o no pertenece al usuario autenticado:
      ```json
      {
        "success": false,
        "message": "Licitación no encontrada",
        "code": "TENDER_NOT_FOUND"
      }
      ```
  * **`409 Conflict`** (Cuenta inactiva):
    ```json
    {
      "success": false,
      "message": "Cuenta inactiva",
      "code": "ACCOUNT_NOT_ACTIVE"
    }
    ```

---

## 6. Obtener Todas las Licitaciones

Obtiene una lista paginada y opcionalmente filtrada de licitaciones. Las empresas (`COMPANY`) solo pueden ver licitaciones aprobadas (`APPROVED`). Los evaluadores municipales (`MUNICIPAL_EVALUATOR`) solo pueden ver las licitaciones creadas por ellos mismos (`idCreator` coincidente con su ID de usuario) y cuyo estado no sea archivado (`ARCHIVED`) (es decir, en estados `DRAFT`, `PENDING`, `APPROVED`, `REJECTED`, `CLOSED`).

* **Endpoint**: `/api/v1/tenders/get-all-tenders`
* **Método**: `GET`
* **Autenticación/Autorización**: Requiere cookies `token` y `refreshToken` activas. El usuario debe tener el rol `COMPANY` o `MUNICIPAL_EVALUATOR`.
* **Parámetros de Consulta (`Query`)**:
  * `page`: Número de página para paginación (ej. `1`).
  * `limit`: Cantidad de resultados por página (ej. `10`).
  * `title` (opcional): Filtrar por coincidencia exacta del título de la licitación.
  * `location` (opcional): Filtrar por coincidencia exacta de la ubicación.
  * `municipality` (opcional): Filtrar por coincidencia exacta del municipio.
  * `executionPeriod` (opcional): Filtrar por coincidencia exacta del periodo de ejecución.
* **Respuestas Posibles**:
  * **`201 Created`** (Éxito):
    ```json
    {
      "success": true,
      "message": "Licitaciones encontradas exitosamente",
      "code": "TENDERS_FOUND",
      "data": {
        "findTenders": [
          {
            "id": "UUID_DE_LA_LICITACION",
            "idCreator": "UUID_DEL_CREADOR",
            "status": "APPROVED", // APPROVED para COMPANY; DRAFT, PENDING, APPROVED, REJECTED, CLOSED para MUNICIPAL_EVALUATOR
            "title": "Título de la licitación",
            "location": "Ubicación física",
            "coorX": -12.046374,
            "coorY": -77.042793,
            "description": "Descripción detallada",
            "executionPeriod": "30 días",
            "contact": "Contacto municipal",
            "municipality": "Nombre del Municipio",
            "createdAt": "2026-07-07T08:00:00.000Z"
          }
        ],
        "totalTenders": 1
      }
    }
    ```
  * **`401 Unauthorized`** (Token inválido o expirado):
    ```json
    {
      "success": false,
      "message": "Token inválido",
      "code": "TOKEN_INVALID"
    }
    ```
  * **`403 Forbidden`** (Rol no autorizado):
    ```json
    {
      "success": false,
      "message": "Usuario no autorizado",
      "code": "USER_NOT_AUTHORIZED"
    }
    ```
  * **`500 Internal Server Error`**:
    ```json
    {
      "success": false,
      "message": "Error al buscar las licitaciones",
      "code": "INTERNAL_SERVER_ERROR"
    }
    ```

---

## 7. Obtener una Licitación por ID

Obtiene los detalles de una licitación específica por su identificador UUID.
* Si el usuario posee el rol `COMPANY`, la licitación solo se retornará si su estado es aprobado (`APPROVED`).
* Si el usuario posee el rol `MUNICIPAL_EVALUATOR`, la licitación solo se retornará si fue creada por él mismo (`idCreator` coincidente con su ID de usuario) y su estado no es archivado (`ARCHIVED`) (es decir, en estados `DRAFT`, `PENDING`, `APPROVED`, `REJECTED`, `CLOSED`). En caso contrario, se retornará `404 Not Found`.

* **Endpoint**: `/api/v1/tenders/get-tender/:id`
* **Método**: `GET`
* **Autenticación/Autorización**: Requiere cookies `token` y `refreshToken` activas. El usuario debe tener el rol `COMPANY` o `MUNICIPAL_EVALUATOR`.
* **Parámetro de Ruta (`Params`)**:
  * `id`: UUID de la licitación que se desea consultar.
* **Respuestas Posibles**:
  * **`201 Created`** (Éxito):
    ```json
    {
      "success": true,
      "message": "Licitación encontrada exitosamente",
      "code": "TENDER_FOUND",
      "data": {
        "id": "UUID_DE_LA_LICITACION",
        "idCreator": "UUID_DEL_CREADOR",
        "status": "APPROVED",
        "title": "Título de la licitación",
        "location": "Ubicación física",
        "coorX": -12.046374,
        "coorY": -77.042793,
        "description": "Descripción detallada",
        "executionPeriod": "30 días",
        "contact": "Contacto municipal",
        "municipality": "Nombre del Municipio",
        "createdAt": "2026-07-07T08:00:00.000Z"
      }
    }
    ```
  * **`400 Bad Request`** (ID inválido o con formato erróneo):
    ```json
    {
      "success": false,
      "message": "El id de la licitación es invalido.",
      "code": "VALIDATION_ERROR"
    }
    ```
  * **`401 Unauthorized`** (Token inválido o expirado):
    ```json
    {
      "success": false,
      "message": "Token inválido",
      "code": "TOKEN_INVALID"
    }
    ```
  * **`403 Forbidden`** (Rol no autorizado):
    ```json
    {
      "success": false,
      "message": "Usuario no autorizado",
      "code": "USER_NOT_AUTHORIZED"
    }
    ```
  * **`404 Not Found`** (Licitación no encontrada, no aprobada si es una empresa, o no creada por el evaluador autenticado):
    ```json
    {
      "success": false,
      "message": "Licitación no encontrada",
      "code": "TENDER_NOT_FOUND"
    }
    ```
  * **`500 Internal Server Error`**:
    ```json
    {
      "success": false,
      "message": "Error al buscar la licitación",
      "code": "INTERNAL_SERVER_ERROR"
    }
    ```
