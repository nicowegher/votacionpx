# App de Votación

Aplicación de votación desarrollada con Next.js, React y Firebase.

## 🚀 Características

- Sistema de votación en tiempo real
- Dashboard administrativo
- Autenticación con Firebase
- Interfaz moderna y responsive

## 📋 Requisitos Previos

- Node.js 18+ 
- npm, yarn o pnpm
- Cuenta de Firebase
- Cuenta de GitHub
- Cuenta de Vercel

## 🛠️ Instalación Local

1. Clona el repositorio:
```bash
git clone <url-del-repositorio>
cd app-de-votacion
```

2. Instala las dependencias:
```bash
npm install
# o
yarn install
# o
pnpm install
```

3. Crea un archivo `.env.local` con tus variables de entorno de Firebase:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
```

4. Ejecuta el servidor de desarrollo:
```bash
npm run dev
# o
yarn dev
# o
pnpm dev
```

5. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🚀 Deployment en Vercel

### Paso 1: Subir a GitHub

1. Crea un nuevo repositorio en GitHub
2. Sigue las instrucciones para conectar tu repositorio local

### Paso 2: Configurar Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Haz clic en "Add New Project"
3. Importa tu repositorio de GitHub
4. Configura las variables de entorno en la sección "Environment Variables"
5. Haz clic en "Deploy"

### Variables de Entorno en Vercel

Asegúrate de configurar todas las variables de entorno que comienzan con `NEXT_PUBLIC_` en el dashboard de Vercel.

## 📝 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run start` - Inicia el servidor de producción
- `npm run lint` - Ejecuta el linter

## 🏗️ Estructura del Proyecto

```
app-de-votacion/
├── app/              # Rutas de Next.js App Router
├── components/       # Componentes React
├── lib/             # Utilidades y configuraciones
├── hooks/           # Custom hooks
├── public/          # Archivos estáticos
└── styles/          # Estilos globales
```

## 📄 Licencia

Este proyecto es privado.

