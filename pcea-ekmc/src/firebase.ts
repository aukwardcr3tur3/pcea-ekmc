import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, addDoc, onSnapshot, query, where, orderBy, limit, Timestamp, getDocFromServer, Firestore, serverTimestamp } from 'firebase/firestore';
import { getAnalytics, Analytics, isSupported } from 'firebase/analytics';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase SDK only if config is valid
let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;
let analytics: Analytics | undefined;

const isFirebaseConfigured = !!(firebaseConfig.apiKey && firebaseConfig.projectId);

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    // Use default database if firestoreDatabaseId is "(default)", empty, or undefined
    const dbId = (!firebaseConfig.firestoreDatabaseId || firebaseConfig.firestoreDatabaseId === "(default)") 
      ? undefined 
      : firebaseConfig.firestoreDatabaseId;
    
    db = getFirestore(app, dbId);
    auth = getAuth(app);
    
    // Initialize Analytics only if supported
    isSupported().then(supported => {
      if (supported && app) {
        analytics = getAnalytics(app);
      }
    });
  } catch (error) {
    console.error("Firebase initialization failed:", error);
  }
} else {
  console.warn("Firebase is not configured. Please check your firebase-applet-config.json.");
}

export { app, db, auth, analytics, isFirebaseConfigured };

// Error Handling Spec for Firestore Operations
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate Connection to Firestore
async function testConnection() {
  if (!db) return;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error(`Firestore connection failed: The client is offline. This usually means the Firestore database has not been created in the Firebase Console or is in the wrong mode. Please ensure you have created a Firestore database in 'Native' mode at https://console.firebase.google.com/project/pcea-elijah-kagiri/firestore/databases/${firebaseConfig.firestoreDatabaseId}/data`);
    }
    // Skip logging for other errors, as this is simply a connection test.
  }
}
testConnection();

export { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc,
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  limit, 
  Timestamp,
  serverTimestamp,
  signInWithPopup,
  GoogleAuthProvider
};
