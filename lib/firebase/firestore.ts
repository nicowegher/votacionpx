import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  Timestamp,
  QuerySnapshot,
  DocumentData,
} from "firebase/firestore"
import { db } from "./config"

// Tipos
export interface Vote {
  userId: string
  userEmail: string
  ranking: string[]
  timestamp: Timestamp
  timeExpired: boolean
  voteStartTime: Timestamp
}

export interface VotingConfig {
  status: "active" | "closed"
  projects: Array<{
    id: string
    name: string
    description: string
    emoji: string
  }>
  lastUpdated: Timestamp
  updatedBy: string
}

// Funciones para votos
// Función helper para validar email (debe coincidir con login-screen.tsx)
const isValidEmailFormat = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false
  const emailLower = email.toLowerCase()
  const ALLOWED_EMAILS = [
    "nicolas.wegher@gmail.com",
    "camigd2901@gmail.com",
    "socuerdo@gmail.com",
    "pablomartino94@gmail.com",
    "digitalhotelero@gmail.com",
  ]
  return (
    ALLOWED_EMAILS.includes(emailLower) ||
    emailLower.endsWith("@pxsol.com") ||
    emailLower.endsWith("@racimo.tech")
  )
}

export const saveVote = async (vote: Omit<Vote, "timestamp">): Promise<void> => {
  if (!db) {
    throw new Error("Firestore no está inicializado")
  }
  
  // Validación previa del email
  if (!vote.userEmail || !isValidEmailFormat(vote.userEmail)) {
    const error = new Error("El email proporcionado no está autorizado para votar")
    ;(error as any).code = "invalid-email"
    throw error
  }
  
  try {
    // #region agent log
    const { auth } = await import("./config")
    const currentAuthUser = auth?.currentUser
    fetch('http://127.0.0.1:7242/ingest/4876ae02-0446-4330-aaad-a1d089f88778',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'firestore.ts:40',message:'saveVote entry',data:{voteUserId:vote.userId,voteUserEmail:vote.userEmail,currentAuthUid:currentAuthUser?.uid,currentAuthEmail:currentAuthUser?.email,isAuthenticated:!!currentAuthUser,userIdMatch:vote.userId===currentAuthUser?.uid,emailMatch:vote.userEmail===currentAuthUser?.email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C,E'})}).catch(()=>{});
    // #endregion
    
    // VERIFICAR SI EL USUARIO YA VOTÓ ANTES DE CREAR UN NUEVO DOCUMENTO
    const existingVote = await getUserVote(vote.userId)
    if (existingVote) {
      const error = new Error("El usuario ya ha votado anteriormente")
      ;(error as any).code = "already-voted"
      throw error
    }
    
    const voteRef = doc(collection(db, "votes"))
    const voteData = {
      ...vote,
      timestamp: Timestamp.now(),
    }
    // #region agent log
    const configRef = doc(db, "config", "voting")
    const configSnap = await getDoc(configRef)
    const votingConfigCheck = configSnap.exists() ? configSnap.data() as { status?: string } : null
    fetch('http://127.0.0.1:7242/ingest/4876ae02-0446-4330-aaad-a1d089f88778',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'firestore.ts:47',message:'before setDoc',data:{voteDataUserId:voteData.userId,voteDataUserEmail:voteData.userEmail,currentAuthUid:auth?.currentUser?.uid,votingConfigStatus:votingConfigCheck?.status,isVotingClosed:votingConfigCheck?.status==='closed'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,D'})}).catch(()=>{});
    // #endregion
    await setDoc(voteRef, voteData)
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/4876ae02-0446-4330-aaad-a1d089f88778',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'firestore.ts:50',message:'saveVote success',data:{voteId:voteRef.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C,E'})}).catch(()=>{});
    // #endregion
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/4876ae02-0446-4330-aaad-a1d089f88778',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'firestore.ts:52',message:'saveVote error',data:{errorCode:(error as any)?.code,errorMessage:(error as any)?.message,errorName:(error as any)?.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C,D,E'})}).catch(()=>{});
    // #endregion
    console.error("Error saving vote:", error)
    throw error
  }
}

export const getUserVote = async (userId: string): Promise<Vote | null> => {
  if (!db) {
    throw new Error("Firestore no está inicializado")
  }
  try {
    const votesRef = collection(db, "votes")
    const q = query(votesRef, where("userId", "==", userId))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      return null
    }

    const voteDoc = querySnapshot.docs[0]
    return voteDoc.data() as Vote
  } catch (error: any) {
    console.error("Error getting user vote:", error)
    // Si es un error de offline, intentar habilitar la red
    if (error?.code === "unavailable" || error?.message?.includes("offline")) {
      const { enableNetwork } = await import("firebase/firestore")
      if (db) {
        try {
          await enableNetwork(db)
          // Reintentar una vez
          const votesRef = collection(db, "votes")
          const q = query(votesRef, where("userId", "==", userId))
          const querySnapshot = await getDocs(q)
          if (!querySnapshot.empty) {
            return querySnapshot.docs[0].data() as Vote
          }
        } catch (retryError) {
          console.error("Error on retry:", retryError)
        }
      }
    }
    // Si aún falla, retornar null
    return null
  }
}

export const getAllVotes = async (): Promise<Vote[]> => {
  if (!db) {
    throw new Error("Firestore no está inicializado")
  }
  try {
    const votesRef = collection(db, "votes")
    const querySnapshot = await getDocs(votesRef)
    return querySnapshot.docs.map((doc) => doc.data() as Vote)
  } catch (error) {
    console.error("Error getting all votes:", error)
    throw error
  }
}

export const subscribeToVotes = (
  callback: (votes: Vote[]) => void,
  onError?: (error: Error) => void
): (() => void) => {
  if (!db) {
    return () => {}
  }
  const votesRef = collection(db, "votes")
  return onSnapshot(
    votesRef,
    (snapshot: QuerySnapshot<DocumentData>) => {
      const votes = snapshot.docs.map((doc) => doc.data() as Vote)
      callback(votes)
    },
    (error) => {
      console.error("Error en listener de votos:", error)
      if (onError) {
        onError(error as Error)
      }
    }
  )
}

// Funciones para configuración de votación
export const getVotingConfig = async (): Promise<VotingConfig | null> => {
  if (!db) {
    throw new Error("Firestore no está inicializado")
  }
  try {
    const configRef = doc(db, "config", "voting")
    const configSnap = await getDoc(configRef)

    if (!configSnap.exists()) {
      return null
    }

    return configSnap.data() as VotingConfig
  } catch (error: any) {
    console.error("Error getting voting config:", error)
    // Si es un error de offline, intentar habilitar la red
    if (error?.code === "unavailable" || error?.message?.includes("offline")) {
      const { enableNetwork } = await import("firebase/firestore")
      if (db) {
        try {
          await enableNetwork(db)
          // Reintentar una vez
          const configRef = doc(db, "config", "voting")
          const configSnap = await getDoc(configRef)
          if (configSnap.exists()) {
            return configSnap.data() as VotingConfig
          }
        } catch (retryError) {
          console.error("Error on retry:", retryError)
        }
      }
    }
    // Si aún falla, retornar null en lugar de lanzar error
    return null
  }
}

export const updateVotingStatus = async (
  status: "active" | "closed",
  updatedBy: string
): Promise<void> => {
  if (!db) {
    throw new Error("Firestore no está inicializado")
  }
  try {
    const configRef = doc(db, "config", "voting")
    const currentConfig = await getVotingConfig()

    if (!currentConfig) {
      // Crear configuración inicial si no existe
      await setDoc(configRef, {
        status,
        projects: [
          {
            id: "1",
            name: "Copilot IA",
            description:
              "Asistente que procesa tu pantalla en tiempo real, te guía clic a clic, interpreta errores en vivo y te dice exactamente qué hacer.",
            emoji: "🖥️",
          },
          {
            id: "2",
            name: "Conciliación Bancaria IA",
            description:
              "El Bot de Conciliación Inteligente de Pxsol que analiza automáticamente y en segundos los datos del PMS, Movimientos bancarios, Compras y ventas.",
            emoji: "🏦",
          },
          {
            id: "3",
            name: "MentorIA",
            description:
              "Agente Pxsolero Interdisciplinario que centraliza el conocimiento y los flujos de trabajo entre distintas áreas con el fin de reducir consultas cruzadas y aumentar la eficiencia operativa.",
            emoji: "🧠",
          },
        ],
        lastUpdated: Timestamp.now(),
        updatedBy,
      })
    } else {
      await updateDoc(configRef, {
        status,
        lastUpdated: Timestamp.now(),
        updatedBy,
      })
    }
  } catch (error) {
    console.error("Error updating voting status:", error)
    throw error
  }
}

export const subscribeToVotingConfig = (
  callback: (config: VotingConfig | null) => void,
  onError?: (error: Error) => void
): (() => void) => {
  if (!db) {
    return () => {}
  }
  const configRef = doc(db, "config", "voting")
  return onSnapshot(
    configRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as VotingConfig)
      } else {
        callback(null)
      }
    },
    (error) => {
      console.error("Error en listener de configuración de votación:", error)
      if (onError) {
        onError(error as Error)
      }
      // En caso de error, intentar obtener la configuración una vez
      getVotingConfig()
        .then((config) => callback(config))
        .catch((err) => {
          console.error("Error al obtener configuración después de error en listener:", err)
          callback(null)
        })
    }
  )
}

