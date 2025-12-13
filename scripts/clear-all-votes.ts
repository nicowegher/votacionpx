import * as admin from "firebase-admin"
import * as dotenv from "dotenv"
import { resolve } from "path"
import { existsSync, readFileSync } from "fs"

// Obtener el directorio raíz del proyecto
const projectRoot = process.cwd()

// Cargar variables de entorno
dotenv.config({ path: resolve(projectRoot, ".env.local") })

// Inicializar Firebase Admin
if (!admin.apps.length) {
  const serviceAccountPath = resolve(projectRoot, "serviceAccountKey.json")
  
  // Intentar usar credenciales de servicio si están disponibles
  if (existsSync(serviceAccountPath)) {
    try {
      const serviceAccountContent = readFileSync(serviceAccountPath, "utf-8")
      const serviceAccount = JSON.parse(serviceAccountContent)
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      })
      console.log("✅ Firebase Admin inicializado con credenciales de servicio.")
    } catch (error) {
      console.error("❌ Error al cargar credenciales de servicio:", error)
      throw error
    }
  } else {
    // Intentar usar Application Default Credentials (requiere gcloud auth)
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    
    if (!projectId) {
      throw new Error(
        "\n❌ No se encontraron credenciales de Firebase.\n\n" +
        "Opciones:\n" +
        "1. Descarga el archivo de credenciales de servicio desde Firebase Console:\n" +
        "   - Ve a Firebase Console > Configuración del proyecto > Cuentas de servicio\n" +
        "   - Genera una nueva clave privada\n" +
        "   - Guarda el archivo JSON como 'serviceAccountKey.json' en la raíz del proyecto\n\n" +
        "2. O configura gcloud CLI y autentícate:\n" +
        "   - Instala gcloud CLI\n" +
        "   - Ejecuta: gcloud auth application-default login\n" +
        "   - Asegúrate de tener NEXT_PUBLIC_FIREBASE_PROJECT_ID en .env.local\n"
      )
    }
    
    try {
      admin.initializeApp({
        projectId: projectId,
      })
      console.log("✅ Firebase Admin inicializado con Application Default Credentials.")
    } catch (error) {
      console.error("❌ Error al inicializar Firebase Admin:", error)
      throw new Error(
        "\n❌ No se pudo inicializar Firebase Admin.\n\n" +
        "Asegúrate de tener configurado gcloud CLI:\n" +
        "  gcloud auth application-default login\n\n" +
        "O descarga el archivo serviceAccountKey.json desde Firebase Console."
      )
    }
  }
}

const db = admin.firestore()

async function clearAllVotes() {
  try {
    console.log("🔄 Iniciando borrado de todos los votos...")
    
    // Obtener todos los documentos de la colección "votes"
    const votesRef = db.collection("votes")
    const snapshot = await votesRef.get()
    
    if (snapshot.empty) {
      console.log("✅ No hay votos para borrar. La colección 'votes' está vacía.")
      return
    }
    
    console.log(`📊 Encontrados ${snapshot.size} votos para borrar.`)
    
    // Borrar todos los documentos en lotes
    let totalDeleted = 0
    const batchSize = 500
    
    for (let i = 0; i < snapshot.docs.length; i += batchSize) {
      const batch = db.batch()
      const batchDocs = snapshot.docs.slice(i, i + batchSize)
      
      batchDocs.forEach((doc) => {
        batch.delete(doc.ref)
      })
      
      await batch.commit()
      totalDeleted += batchDocs.length
      console.log(`  ✓ Borrados ${totalDeleted}/${snapshot.size} votos...`)
    }
    
    console.log(`✅ Se borraron exitosamente ${totalDeleted} votos.`)
    
    // Opcional: Resetear el estado de la votación a "active"
    const configRef = db.doc("config/voting")
    const configDoc = await configRef.get()
    
    if (configDoc.exists) {
      await configRef.update({
        status: "active",
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        updatedBy: "system-clear-script",
      })
      console.log("✅ Estado de votación reseteado a 'active'.")
    } else {
      console.log("ℹ️  No se encontró configuración de votación para resetear.")
    }
    
    console.log("🎉 Proceso completado exitosamente.")
  } catch (error) {
    console.error("❌ Error al borrar votos:", error)
    process.exit(1)
  }
}

// Ejecutar el script
clearAllVotes()
  .then(() => {
    console.log("✨ Script finalizado.")
    process.exit(0)
  })
  .catch((error) => {
    console.error("❌ Error fatal:", error)
    process.exit(1)
  })
