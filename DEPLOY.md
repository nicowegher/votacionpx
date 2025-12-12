# Guía de Deployment

## 📤 Subir a GitHub

### 1. Crear repositorio en GitHub

1. Ve a [github.com](https://github.com) e inicia sesión
2. Haz clic en el botón "+" (arriba a la derecha) > "New repository"
3. Nombre: `app-de-votacion` (o el que prefieras)
4. Elige si será Privado o Público
5. **NO marques** "Initialize this repository with a README"
6. Haz clic en "Create repository"

### 2. Conectar repositorio local con GitHub

Después de crear el repositorio, GitHub te mostrará instrucciones. Ejecuta estos comandos en tu terminal (reemplaza `TU_USUARIO` y `TU_REPO` con tus valores reales):

```bash
cd /Users/nicowegher/Documents/Cursor/app-de-votacion

# Agregar el remote de GitHub
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git

# Cambiar el nombre de la rama a main (si es necesario)
git branch -M main

# Subir el código
git push -u origin main
```

**Nota:** Si GitHub te muestra una URL diferente (por ejemplo, con SSH), usa esa en lugar de la HTTPS.

---

## 🚀 Deploy en Vercel

### 1. Conectar con Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión (puedes usar tu cuenta de GitHub)
2. Haz clic en "Add New Project"
3. Selecciona tu repositorio `app-de-votacion` de la lista
4. Vercel detectará automáticamente que es un proyecto Next.js

### 2. Configurar el proyecto

1. **Framework Preset:** Debería detectar "Next.js" automáticamente
2. **Root Directory:** Deja en blanco (o `./` si es necesario)
3. **Build Command:** `npm run build` (o `pnpm build` / `yarn build` según uses)
4. **Output Directory:** `.next` (Vercel lo detecta automáticamente)
5. **Install Command:** `npm install` (o `pnpm install` / `yarn install`)

### 3. Configurar Variables de Entorno

**IMPORTANTE:** Antes de hacer deploy, configura las variables de entorno:

1. En la sección "Environment Variables" del proyecto en Vercel, agrega:

```
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key_aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
```

2. **Obtén estos valores desde:**
   - Ve a [Firebase Console](https://console.firebase.google.com/)
   - Selecciona tu proyecto
   - Ve a ⚙️ Configuración del proyecto
   - Baja hasta "Tus aplicaciones" > "Configuración de SDK"
   - Copia los valores del objeto `firebaseConfig`

3. Asegúrate de agregar las variables para todos los ambientes:
   - Production
   - Preview
   - Development

### 4. Hacer Deploy

1. Haz clic en "Deploy"
2. Vercel construirá y desplegará tu aplicación
3. Una vez completado, obtendrás una URL como: `https://app-de-votacion.vercel.app`

### 5. Configuración Adicional (Opcional)

- **Dominio personalizado:** Puedes agregar un dominio personalizado en Settings > Domains
- **Variables de entorno por ambiente:** Puedes tener diferentes valores para producción, preview y desarrollo

---

## 🔄 Actualizaciones Futuras

Cada vez que hagas `git push` a la rama `main` en GitHub, Vercel automáticamente:
1. Detectará los cambios
2. Construirá la nueva versión
3. La desplegará automáticamente

Puedes ver el estado de los deployments en el dashboard de Vercel.

---

## ⚠️ Notas Importantes

- **Variables de entorno:** Todas las variables que comienzan con `NEXT_PUBLIC_` son accesibles en el cliente
- **Firebase Rules:** Asegúrate de que tus reglas de Firestore estén desplegadas correctamente
- **Índices de Firestore:** Si ves errores de índices, sigue el enlace del error o ejecuta `firebase deploy --only firestore:indexes`

