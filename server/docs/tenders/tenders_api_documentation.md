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
