# Configuración de Firebase para Producción

## 🔐 Dominios Autorizados en Firebase Authentication

Para que los usuarios puedan iniciar sesión desde tu aplicación desplegada en Vercel, necesitas agregar el dominio a los dominios autorizados de Firebase.

### Pasos:

1. Ve a la [Consola de Firebase](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. En el menú lateral, ve a **Authentication** (Autenticación)
4. Haz clic en la pestaña **Settings** (Configuración)
5. Baja hasta la sección **Authorized domains** (Dominios autorizados)
6. Haz clic en **Add domain** (Agregar dominio)
7. Agrega tu dominio de Vercel:
   - `votaenblanco.vercel.app`
8. Haz clic en **Add** (Agregar)

### Dominios que deberías tener:

- `localhost` (ya debería estar para desarrollo)
- `votaenblanco.vercel.app` (tu dominio de producción)
- `vercel.app` (opcional, si quieres permitir todos los proyectos de Vercel)

## 📝 Variables de Entorno en Vercel

Asegúrate de que todas estas variables estén configuradas en Vercel:

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Ve a **Settings** > **Environment Variables**
3. Agrega todas las variables que comienzan con `NEXT_PUBLIC_`:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`

4. Asegúrate de seleccionar los ambientes correctos (Production, Preview, Development)

## ✅ Verificación

Después de agregar el dominio:

1. Espera unos minutos para que los cambios se propaguen
2. Intenta iniciar sesión desde `https://votaenblanco.vercel.app/`
3. Si aún no funciona, verifica que las variables de entorno estén correctamente configuradas en Vercel

## 🔗 Enlaces Útiles

- [Firebase Console](https://console.firebase.google.com/)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Documentación de Firebase Auth - Dominios Autorizados](https://firebase.google.com/docs/auth/web/email-link-auth#authorize-domains-for-email-link-sign-in)

