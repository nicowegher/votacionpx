# Scripts de Utilidad

## clear-all-votes.ts

Este script borra todos los votos de la colección "votes" en Firestore y resetea el estado de la votación a "active".

### Requisitos

Para ejecutar este script, necesitas una de las siguientes opciones:

#### Opción 1: Archivo de Credenciales de Servicio (Recomendado)

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a **Configuración del proyecto** > **Cuentas de servicio**
4. Haz clic en **Generar nueva clave privada**
5. Descarga el archivo JSON
6. Renombra el archivo a `serviceAccountKey.json`
7. Colócalo en la raíz del proyecto (al mismo nivel que `package.json`)

**⚠️ IMPORTANTE:** Asegúrate de agregar `serviceAccountKey.json` a `.gitignore` para no subirlo al repositorio.

#### Opción 2: Google Cloud CLI

1. Instala [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
2. Ejecuta:
   ```bash
   gcloud auth application-default login
   ```
3. Asegúrate de tener `NEXT_PUBLIC_FIREBASE_PROJECT_ID` en tu archivo `.env.local`

### Uso

Ejecuta el script con:

npm run clear-votes```bash

```

El script:
- ✅ Borrará todos los documentos de la colección "votes"
- ✅ Reseteará el estado de la votación a "active" (si existe la configuración)
- ✅ Mostrará el progreso y confirmación de las operaciones

### Advertencia

⚠️ **Este script borra permanentemente todos los votos.** Asegúrate de hacer una copia de seguridad si necesitas conservar los datos.
