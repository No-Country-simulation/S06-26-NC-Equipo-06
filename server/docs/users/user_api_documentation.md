# Documentación de API - Usuarios (Users)

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

## 1. Obtener Perfil del Usuario Autenticado

Obtiene los datos del perfil del usuario que tiene la sesión activa. La respuesta varía según el rol del usuario (`COMPANY`, `ADMIN`, `MUNICIPAL_ADMIN`, `MUNICIPAL_EVALUATOR`).

* **Endpoint**: `/api/v1/users/me/profile`
* **Método**: `GET`
* **Autenticación/Autorización**: Requiere cookies `token` y `refreshToken` activas.
* **¿Qué pide y cómo lo pide?**:
  * Enviado implícitamente en las **Cookies del navegador**:
    * `token` y `refreshToken` (requeridas).
* **Respuestas Posibles**:
  * **`200 OK`** (Éxito - Rol `COMPANY`):
    ```json
    {
      "success": true,
      "message": "Perfil de empresa encontrado",
      "code": "COMPANY_PROFILE_FINDED",
      "data": {
        "id": "uuid-del-usuario",
        "email": "empresa@ejemplo.com",
        "role": "COMPANY",
        "createdAt": "2026-06-20T01:45:15.000Z",
        "updatedAt": "2026-06-20T01:45:15.000Z",
        "companyProfile": {
          "companyName": "Nombre de la Empresa",
          "ruc": "12345678901",
          "taxStatus": "ACTIVO",
          "fiscalAddress": "Av. Principal 123"
        }
      }
    }
    ```
  * **`200 OK`** (Éxito - Rol `ADMIN`):
    ```json
    {
      "success": true,
      "message": "Perfil de administrador encontrado",
      "code": "ADMIN_PROFILE_FINDED",
      "data": {
        "id": "uuid-del-usuario",
        "email": "admin@ejemplo.com",
        "role": "ADMIN",
        "createdAt": "2026-06-20T01:45:15.000Z",
        "updatedAt": "2026-06-20T01:45:15.000Z",
        "adminProfile": {
          "firstName": "Juan",
          "lastName": "Pérez"
        }
      }
    }
    ```
  * **`200 OK`** (Éxito - Rol `MUNICIPAL_ADMIN`):
    ```json
    {
      "success": true,
      "message": "Perfil de administrador municipal encontrado",
      "code": "MUNICIPAL_ADMIN_PROFILE_FINDED",
      "data": {
        "id": "uuid-del-usuario",
        "email": "localadmin@ejemplo.com",
        "role": "MUNICIPAL_ADMIN",
        "createdAt": "2026-06-20T01:45:15.000Z",
        "updatedAt": "2026-06-20T01:45:15.000Z",
        "localAdminProfile": {
          "firstName": "María",
          "lastName": "López",
          "municipality": {
            "name": "Nombre de la Municipalidad"
          }
        }
      }
    }
    ```
  * **`200 OK`** (Éxito - Rol `MUNICIPAL_EVALUATOR`):
    ```json
    {
      "success": true,
      "message": "Perfil de evaluador municipal encontrado",
      "code": "MUNICIPAL_EVALUATOR_PROFILE_FINDED",
      "data": {
        "id": "uuid-del-usuario",
        "email": "evaluador@ejemplo.com",
        "role": "MUNICIPAL_EVALUATOR",
        "createdAt": "2026-06-20T01:45:15.000Z",
        "updatedAt": "2026-06-20T01:45:15.000Z",
        "localEvaluator": {
          "firstName": "Carlos",
          "lastName": "Gómez",
          "municipality": {
            "name": "Nombre de la Municipalidad"
          }
        }
      }
    }
    ```
  * **`401 Unauthorized`** (Errores de middleware de validación):
    * Si la cookie `token` falta, es inválida o expiró:
      ```json
      {
        "success": false,
        "message": "Token inválido",
        "code": "TOKEN_INVALID"
      }
      ```
  * **`403 Forbidden`** (Rol no autorizado/desconocido):
    ```json
    {
      "success": false,
      "message": "Rol no autorizado",
      "code": "ROLE_NOT_AUTHORIZED"
    }
    ```

---

## 2. Actualizar Perfil del Usuario Autenticado

Permite al usuario con sesión activa actualizar sus datos de perfil. Los campos actualizables varían según el rol del usuario.

* **Endpoint**: `/api/v1/users/me/profile`
* **Método**: `PATCH`
* **Autenticación/Autorización**: Requiere cookies `token` y `refreshToken` activas.
* **¿Qué pide y cómo lo pide?**:
  * Enviado implícitamente en las **Cookies del navegador**:
    * `token` y `refreshToken` (requeridas).
  * Enviado en el **cuerpo (`Body` JSON)** (Todos los campos son opcionales y solo se actualizarán los que se envíen):
    * **Para rol `COMPANY`**:
      ```json
      {
        "email": "nuevo_correo@ejemplo.com",
        "companyName": "Nuevo Nombre de Empresa",
        "taxStatus": "ACTIVO",
        "fiscalAddress": "Nueva Dirección Fiscal 123"
      }
      ```
    * **Para roles `ADMIN`, `MUNICIPAL_ADMIN`, `MUNICIPAL_EVALUATOR`**:
      ```json
      {
        "email": "nuevo_correo@ejemplo.com",
        "firstName": "NuevoNombre",
        "lastName": "NuevoApellido"
      }
      ```
* **Respuestas Posibles**:
  * **`200 OK`** (Éxito - Rol `COMPANY`):
    ```json
    {
      "success": true,
      "message": "Perfil de empresa actualizado exitosamente",
      "code": "COMPANY_PROFILE_UPDATED_SUCCESS"
    }
    ```
  * **`200 OK`** (Éxito - Rol `ADMIN`):
    ```json
    {
      "success": true,
      "message": "Perfil de administrador actualizado exitosamente",
      "code": "ADMIN_PROFILE_UPDATED_SUCCESS"
    }
    ```
  * **`200 OK`** (Éxito - Rol `MUNICIPAL_ADMIN`):
    ```json
    {
      "success": true,
      "message": "Perfil de administrador municipal actualizado exitosamente",
      "code": "MUNICIPAL_ADMIN_PROFILE_UPDATED_SUCCESS"
    }
    ```
  * **`200 OK`** (Éxito - Rol `MUNICIPAL_EVALUATOR`):
    ```json
    {
      "success": true,
      "message": "Perfil de evaluador municipal actualizado exitosamente",
      "code": "MUNICIPAL_EVALUATOR_PROFILE_UPDATED_SUCCESS"
    }
    ```
  * **`401 Unauthorized`** (Errores de middleware de validación):
    * Si la cookie `token` falta, es inválida o expiró:
      ```json
      {
        "success": false,
        "message": "Token inválido",
        "code": "TOKEN_INVALID"
      }
      ```
  * **`403 Forbidden`** (Usuario no autorizado o discrepancia de rol/ID):
    ```json
    {
      "success": false,
      "message": "Usuario no autorizado",
      "code": "USER_NOT_AUTHORIZED"
    }
    ```
  * **`404 Not Found`** (Usuario no encontrado):
    ```json
    {
      "success": false,
      "message": "Usuario no encontrado",
      "code": "USER_NOT_FOUND"
    }
    ```
