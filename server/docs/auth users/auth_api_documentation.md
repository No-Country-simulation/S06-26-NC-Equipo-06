## Estructuras de Respuesta Estándar

### Respuesta Exitosa (`success: true`)
Todos los endpoints exitosos retornan una estructura JSON uniforme:
```json
{
  "success": true,
  "message": "Mensaje descriptivo del resultado",
  "code": "CODIGO_DE_OPERACION"
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

## 1. Registro de Empresa

Permite registrar un nuevo usuario con rol `COMPANY` y su perfil de empresa asociado. Envía un correo de verificación.

* **Endpoint**: `/api/v1/auth-users/register`
* **Método**: `POST`
* **¿Qué pide y cómo lo pide?**:
  * Enviado en el **cuerpo (`Body` JSON)**:
    ```json
    {
      "email": "correo@ejemplo.com",
      "password": "contraseña_segura",
      "ruc": "12345678901",
      "companyName": "Nombre de la Empresa"
    }
    ```
* **Respuestas Posibles**:
  * **`201 Created`** (Éxito):
    ```json
    {
      "success": true,
      "message": "Empresa registrada exitosamente, por favor verifica tu email para activar tu cuenta",
      "code": "COMPANY_REGISTRATION_COMPLETED"
    }
    ```
  * **`409 Conflict`** (Email ya registrado):
    ```json
    {
      "success": false,
      "message": "Email ya registrado",
      "code": "EMAIL_ALREADY_EXISTS"
    }
    ```
  * **`409 Conflict`** (RUC ya registrado):
    ```json
    {
      "success": false,
      "message": "El RUC ya está registrado",
      "code": "RUC_ALREADY_EXISTS"
    }
    ```
  * **`500 Internal Server Error`** (Error de validación de esquema o error inesperado):
    ```json
    {
      "success": false,
      "message": "Ocurrió un error interno en el servidor",
      "code": "INTERNAL_SERVER_ERROR"
    }
    ```

---

## 2. Verificar Correo Electrónico

Valida el token enviado por correo para activar la cuenta de un usuario recién registrado.

* **Endpoint**: `/api/v1/auth-users/verify-email/:token`
* **Método**: `POST`
* **¿Qué pide y cómo lo pide?**:
  * Enviado como **parámetro de ruta (`Params`)**:
    * `:token` (String, el JWT de verificación recibido en el email).
* **Respuestas Posibles**:
  * **`200 OK`** (Éxito):
    ```json
    {
      "success": true,
      "message": "Email verificado exitosamente",
      "code": "EMAIL_VERIFICATION_COMPLETED"
    }
    ```
  * **`400 Bad Request`** (Token inválido o expirado):
    ```json
    {
      "success": false,
      "message": "Token de verificacion no valido",
      "code": "INVALID_TOKEN"
    }
    ```
  * **`404 Not Found`** (El usuario del token no existe):
    ```json
    {
      "success": false,
      "message": "El usuario no existe",
      "code": "USER_NOT_FOUND"
    }
    ```
  * **`409 Conflict`** (El usuario ya estaba verificado):
    ```json
    {
      "success": false,
      "message": "El usuario ya ha sido verificado",
      "code": "EMAIL_ALREADY_VERIFIED"
    }
    ```

---

## 3. Reenviar Enlace de Verificación de Correo

Permite solicitar un nuevo correo electrónico con token de verificación.

* **Endpoint**: `/api/v1/auth-users/resend-verification-email/:email`
* **Método**: `POST`
* **¿Qué pide y cómo lo pide?**:
  * Enviado como **parámetro de ruta (`Params`)**:
    * `:email` (String, correo registrado).
* **Respuestas Posibles**:
  * **`200 OK`** (Éxito):
    ```json
    {
      "success": true,
      "message": "Se ha enviado un nuevo enlace de verificación de correo electrónico",
      "code": "EMAIL_VERIFICATION_RESENT"
    }
    ```
  * **`404 Not Found`** (Usuario inexistente):
    ```json
    {
      "success": false,
      "message": "El usuario no existe",
      "code": "USER_NOT_FOUND"
    }
    ```
  * **`409 Conflict`** (Usuario ya verificado):
    ```json
    {
      "success": false,
      "message": "El usuario ya ha sido verificado",
      "code": "EMAIL_ALREADY_VERIFIED"
    }
    ```

---

## 4. Iniciar Sesión (Login)

Autentica las credenciales y establece las cookies HTTP-Only de sesión `token` y `refreshToken`.

* **Endpoint**: `/api/v1/auth-users/login`
* **Método**: `POST`
* **¿Qué pide y cómo lo pide?**:
  * Enviado en el **cuerpo (`Body` JSON)**:
    ```json
    {
      "email": "correo@ejemplo.com",
      "password": "contraseña_valida"
    }
    ```
* **Respuestas Posibles**:
  * **`200 OK`** (Éxito - establece cookies en el navegador):
    * *Cuerpo (JSON)*:
      ```json
      {
        "success": true,
        "message": "Inicio de sesión exitoso",
        "code": "LOGIN_COMPLETED"
      }
      ```
  * **`400 Bad Request`** (Cuenta no activa):
    ```json
    {
      "success": false,
      "message": "Su cuenta no esta activada",
      "code": "ACCOUNT_NOT_ACTIVE"
    }
    ```
  * **`401 Unauthorized`** (Contraseña incorrecta):
    ```json
    {
      "success": false,
      "message": "Contraseña incorrecta",
      "code": "INVALID_PASSWORD"
    }
    ```
  * **`404 Not Found`** (Usuario inexistente o rol no autorizado):
    ```json
    {
      "success": false,
      "message": "Usuario no encontrado",
      "code": "USER_NOT_FOUND"
    }
    ```

---

## 5. Verificar Estado de Autenticación

Verifica si la sesión actual del usuario (a través de cookies JWT) sigue activa y es válida.

* **Endpoint**: `/api/v1/auth-users/verify-auth`
* **Método**: `GET`
* **¿Qué pide y cómo lo pide?**:
  * Enviado implícitamente en las **Cookies del navegador**:
    * `token` y `refreshToken` (requeridas).
* **Respuestas Posibles**:
  * **`200 OK`** (Autenticación exitosa):
    ```json
    {
      "success": true,
      "message": "Usuario autenticado",
      "code": "USER_AUTHENTICATED"
    }
    ```
  * **`401 Unauthorized`** (Errores de middleware de validación):
    * Si falta la cookie de acceso `token`:
      ```json
      {
        "success": false,
        "message": "No estás autorizado (falta token)",
        "code": "TOKEN_INVALID"
      }
      ```
    * Si la cookie de acceso `token` es inválida o expiró:
      ```json
      {
        "success": false,
        "message": "Token inválido",
        "code": "TOKEN_INVALID"
      }
      ```
    * Si falta la cookie de refresco `refreshToken`:
      ```json
      {
        "success": false,
        "message": "No estás autorizado (falta refreshToken)",
        "code": "TOKEN_INVALID"
      }
      ```
    * Si el refresco `refreshToken` es inválido:
      ```json
      {
        "success": false,
        "message": "Refresh token inválido",
        "code": "TOKEN_INVALID"
      }
      ```
    * Si la sesión de refresco fue revocada o no existe en la base de datos:
      ```json
      {
        "success": false,
        "message": "Sesión inválida o expirada by refresh token",
        "code": "TOKEN_INVALID"
      }
      ```
    * Si el usuario no está autorizado (IDs no coinciden):
      ```json
      {
        "success": false,
        "message": "Usuario no autorizado by refresh token",
        "code": "TOKEN_INVALID"
      }
      ```
    * Si el usuario del token está deshabilitado:
      ```json
      {
        "success": false,
        "message": "Usuario deshabilitado",
        "code": "USER_DISABLED"
      }
      ```
  * **`404 Not Found`** (Usuario no encontrado):
    * Si el usuario no existe en la base de datos (por token de acceso):
      ```json
      {
        "success": false,
        "message": "Usuario no encontrado",
        "code": "USER_NOT_FOUND"
      }
      ```
    * Si el usuario no existe en la base de datos (por refresh token):
      ```json
      {
        "success": false,
        "message": "Usuario no encontrado by refresh token",
        "code": "USER_NOT_FOUND"
      }
      ```

---

## 6. Cerrar Sesión (Logout)

Revoca el refresh token en la base de datos y borra las cookies locales de autenticación.

* **Endpoint**: `/api/v1/auth-users/logout`
* **Método**: `POST`
* **¿Qué pide y cómo lo pide?**:
  * Enviado implícitamente en las **Cookies del navegador**:
    * `token` y `refreshToken` (requeridas).
* **Respuestas Posibles**:
  * **`200 OK`** (Éxito - limpia las cookies):
    ```json
    {
      "success": true,
      "message": "Logout exitoso",
      "code": "LOGOUT_COMPLETED"
    }
    ```
  * **`401 Unauthorized`** / **`404 Not Found`**:
    * Si fallan las validaciones del `tokenMiddleware` o del `refreshToken` (mismos errores que en `/verify-auth`).
  * **`404 Not Found`** (Sesión no encontrada en base de datos al hacer logout):
    ```json
    {
      "success": false,
      "message": "Sesión no encontrada",
      "code": "SESSION_NOT_FOUND"
    }
    ```
