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

## Roles del Sistema

El sistema gestiona los permisos y flujos de registro a través de cuatro roles de usuario:

* **`COMPANY` (Empresa)**:
  * **Descripción**: Representa a una empresa que se registra para realizar trámites o gestiones en la plataforma.
  * **Registro**: Público. Cualquier empresa puede registrarse libremente mediante el formulario de registro (`/api/v1/auth-users/register`).

* **`ADMIN` (Administrador General)**:
  * **Descripción**: Administrador global de la plataforma con permisos totales de gestión de usuarios y configuraciones.
  * **Registro**: Privado. Solo puede ser registrado por otro administrador general activo (`/api/v1/auth-users/admin-register`).

* **`MUNICIPAL_ADMIN` (Administrador Municipal)**:
  * **Descripción**: Administrador asignado a una municipalidad específica. Su función principal es gestionar y registrar a los evaluadores de su jurisdicción.
  * **Registro**: Privado. Es registrado por un administrador general (`ADMIN`) y asociado a una municipalidad específica (`/api/v1/auth-users/register-local-admin`).

* **`MUNICIPAL_EVALUATOR` (Evaluador Municipal)**:
  * **Descripción**: Encargado de revisar, auditar y calificar las solicitudes y trámites presentados por las empresas en su municipalidad.
  * **Registro**: Privado. Es registrado únicamente por el administrador municipal (`MUNICIPAL_ADMIN`) de su mismo municipio (`/api/v1/auth-users/register-evaluator`).

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
    * **Cookies devueltas (HTTP-Only)**:
      * `token`: JWT de acceso de sesión (expira en 24 horas).
      * `refreshToken`: JWT de refresco de sesión (expira en 7 días).
    * *Cuerpo (JSON)*:
      ```json
      {
        "success": true,
        "message": "Inicio de sesión exitoso",
        "code": "LOGIN_COMPLETED",
        "role": "MUNICIPAL_EVALUATOR"
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

---

## 7. Registro de Administrador General (Admin Register)

Permite a un administrador del sistema registrar un nuevo usuario con rol `ADMIN`. Se le envía un correo electrónico de invitación con un enlace seguro para establecer su contraseña.

* **Endpoint**: `/api/v1/auth-users/admin-register`
* **Método**: `POST`
* **Autenticación/Autorización**: Requiere cookies `token` y `refreshToken` activas. Solo accesible para usuarios con el rol `ADMIN`.
* **¿Qué pide y cómo lo pide?**:
  * Enviado en el **cuerpo (`Body` JSON)**:
    ```json
    {
      "email": "admin@ejemplo.com",
      "firstName": "Juan",
      "lastName": "Pérez"
    }
    ```
* **Respuestas Posibles**:
  * **`201 Created`** (Éxito):
    ```json
    {
      "success": true,
      "message": "Registro de administrador exitoso",
      "code": "ADMIN_REGISTER_COMPLETED"
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

---

## 8. Registro de Administrador Local (Register Local Admin)

Permite a un administrador del sistema registrar un nuevo usuario con rol `MUNICIPAL_ADMIN` asignado a un municipio específico. Se le envía un correo electrónico de invitación con un enlace seguro para establecer su contraseña.

* **Endpoint**: `/api/v1/auth-users/register-local-admin`
* **Método**: `POST`
* **Autenticación/Autorización**: Requiere cookies `token` y `refreshToken` activas. Solo accesible para usuarios con el rol `ADMIN`.
* **¿Qué pide y cómo lo pide?**:
  * Enviado en el **cuerpo (`Body` JSON)**:
    ```json
    {
      "email": "localadmin@ejemplo.com",
      "firstName": "María",
      "lastName": "López",
      "municipality": "uuid-del-municipio"
    }
    ```
* **Respuestas Posibles**:
  * **`201 Created`** (Éxito):
    ```json
    {
      "success": true,
      "message": "Registro de administrador local exitoso",
      "code": "LOCAL_ADMIN_REGISTER_COMPLETED"
    }
    ```
  * **`404 Not Found`** (Municipio no encontrado):
    ```json
    {
      "success": false,
      "message": "Municipio no encontrado",
      "code": "MUNICIPALITY_NOT_FOUND"
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

---

## 9. Registro de Evaluador Local (Register Evaluator)

Permite a un administrador municipal (`MUNICIPAL_ADMIN`) registrar a un evaluador local (`MUNICIPAL_EVALUATOR`) para su mismo municipio. Se le envía un correo electrónico de invitación con un enlace seguro para establecer su contraseña.

* **Endpoint**: `/api/v1/auth-users/register-evaluator`
* **Método**: `POST`
* **Autenticación/Autorización**: Requiere cookies `token` y `refreshToken` activas. Solo accesible para usuarios con el rol `MUNICIPAL_ADMIN`.
* **¿Qué pide y cómo lo pide?**:
  * Enviado en el **cuerpo (`Body` JSON)**:
    ```json
    {
      "email": "evaluador@ejemplo.com",
      "firstName": "Carlos",
      "lastName": "Gómez"
    }
    ```
* **Respuestas Posibles**:
  * **`201 Created`** (Éxito):
    ```json
    {
      "success": true,
      "message": "Registro de evaluador local exitoso",
      "code": "LOCAL_EVALUATOR_REGISTER_COMPLETED"
    }
    ```
  * **`404 Not Found`** (Administrador solicitante no encontrado):
    ```json
    {
      "success": false,
      "message": "Administrador no encontrado",
      "code": "ADMIN_NOT_FOUND"
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

---

## 10. Crear Contraseña desde Invitación (Create Password)

Permite a un usuario invitado (creado por invitación de un administrador) establecer su contraseña y activar su cuenta utilizando el token seguro que recibió por correo.

* **Endpoint**: `/api/v1/auth-users/create-password`
* **Método**: `POST`
* **Autenticación/Autorización**: Ninguna (público).
* **¿Qué pide y cómo lo pide?**:
  * Enviado como **parámetro de consulta (`Query`)**:
    * `token` (String, el token de invitación seguro provisto en el enlace).
  * Enviado en el **cuerpo (`Body` JSON)**:
    ```json
    {
      "password": "mi_nueva_contraseña_segura"
    }
    ```
* **Respuestas Posibles**:
  * **`201 Created`** (Éxito):
    ```json
    {
      "success": true,
      "message": "Contraseña creada exitosamente",
      "code": "PASSWORD_CREATED_COMPLETED"
    }
    ```
  * **`400 Bad Request`** (Invitación expirada o ya utilizada):
    * Si la invitación ha expirado:
      ```json
      {
        "success": false,
        "message": "Invitacion expirada",
        "code": "INVITATION_EXPIRED"
      }
      ```
    * Si la invitación ya fue usada para crear una contraseña:
      ```json
      {
        "success": false,
        "message": "Invitacion ya usada",
        "code": "INVITATION_USED"
      }
      ```
  * **`404 Not Found`** (Invitación no encontrada):
    ```json
    {
      "success": false,
      "message": "Invitacion no encontrada",
      "code": "INVITATION_NOT_FOUND"
    }
    ```

---

## 11. Cambiar Contraseña (Change Password)

Permite a un usuario autenticado cambiar su contraseña actual por una nueva.

* **Endpoint**: `/api/v1/auth-users/change-password`
* **Método**: `PATCH`
* **Autenticación/Autorización**: Requiere cookies `token` y `refreshToken` activas.
* **¿Qué pide y cómo lo pide?**:
  * Enviado en el **cuerpo (`Body` JSON)**:
    ```json
    {
      "password": "nueva_contraseña_segura",
      "oldPassword": "contraseña_actual"
    }
    ```
* **Respuestas Posibles**:
  * **`201 Created`** (Éxito):
    ```json
    {
      "success": true,
      "message": "Contraseña cambiada exitosamente",
      "code": "PASSWORD_CHANGED_COMPLETED"
    }
    ```
  * **`401 Unauthorized`** (Contraseña actual incorrecta):
    ```json
    {
      "success": false,
      "message": "Contraseña incorrecta",
      "code": "INVALID_PASSWORD"
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

---

## 12. Recuperar Contraseña (Recover Password)

Solicita un enlace para restablecer la contraseña. Envía un correo con un token de recuperación.

* **Endpoint**: `/api/v1/auth-users/recover-password`
* **Método**: `POST`
* **Autenticación/Autorización**: Ninguna (público).
* **¿Qué pide y cómo lo pide?**:
  * Enviado en el **cuerpo (`Body` JSON)**:
    ```json
    {
      "email": "correo@ejemplo.com"
    }
    ```
* **Respuestas Posibles**:
  * **`201 Created`** (Éxito):
    ```json
    {
      "success": true,
      "message": "Se ha enviado un nuevo enlace de recuperación de contraseña",
      "code": "PASSWORD_RECOVER_COMPLETED"
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

---

## 13. Establecer Nueva Contraseña (New Password)

Permite establecer una nueva contraseña utilizando el token de recuperación recibido por correo.

* **Endpoint**: `/api/v1/auth-users/new-password`
* **Método**: `POST`
* **Autenticación/Autorización**: Ninguna (público).
* **¿Qué pide y cómo lo pide?**:
  * Enviado como **parámetro de consulta (`Query`)**:
    * `token` (String, el token de recuperación de contraseña).
  * Enviado en el **cuerpo (`Body` JSON)**:
    ```json
    {
      "password": "mi_nueva_contraseña_segura"
    }
    ```
* **Respuestas Posibles**:
  * **`201 Created`** (Éxito):
    ```json
    {
      "success": true,
      "message": "Contraseña cambiada exitosamente",
      "code": "PASSWORD_CHANGED_COMPLETED"
    }
    ```
  * **`400 Bad Request`** (Token expirado o ya utilizado):
    * Si el token ha expirado:
      ```json
      {
        "success": false,
        "message": "Token expirado",
        "code": "TOKEN_EXPIRED"
      }
      ```
    * Si el token ya fue utilizado:
      ```json
      {
        "success": false,
        "message": "Token ya usado",
        "code": "TOKEN_USED"
      }
      ```
  * **`404 Not Found`** (Token no encontrado):
    ```json
    {
      "success": false,
      "message": "Token no encontrado",
      "code": "TOKEN_NOT_FOUND"
    }
    ```

---

## 14. Cerrar Sesión Sin Autorización (Close Session Unauthorized)

Permite cerrar/revocar una sesión específica de forma pública utilizando el token de refresco (por ejemplo, desde un enlace de seguridad enviado al correo).

* **Endpoint**: `/api/v1/auth-users/close-session-unauth`
* **Método**: `POST`
* **Autenticación/Autorización**: Ninguna (público).
* **¿Qué pide y cómo lo pide?**:
  * Enviado como **parámetro de consulta (`Query`)**:
    * `token` (String, el token de refresco de la sesión a cerrar).
* **Respuestas Posibles**:
  * **`200 OK`** (Éxito):
    ```json
    {
      "success": true,
      "message": "Sesion cerrada exitosamente",
      "code": "SESSION_CLOSED_COMPLETED"
    }
    ```
  * **`400 Bad Request`** (Token expirado o sesión ya cerrada):
    * Si el token ha expirado:
      ```json
      {
        "success": false,
        "message": "Token expirado",
        "code": "TOKEN_EXPIRED"
      }
      ```
    * Si la sesión ya fue cerrada:
      ```json
      {
        "success": false,
        "message": "Sesion ya cerrada",
        "code": "SESSION_CLOSED"
      }
      ```
  * **`404 Not Found`** (Token no encontrado):
    ```json
    {
      "success": false,
      "message": "Token no encontrado",
      "code": "TOKEN_NOT_FOUND"
    }
    ```
