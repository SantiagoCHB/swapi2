// firebase/firebaseConfig.js
import { getApps, initializeApp, getApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyCvj8ZmJ1iyg7R2JSJx0Rc0GZP5drwT4zg",
  authDomain: "pokeapi2-a3eab.firebaseapp.com",
  projectId: "pokeapi2-a3eab",
  storageBucket: "pokeapi2-a3eab.firebasestorage.app",
  messagingSenderId: "467904511349",
  appId: "1:467904511349:web:a3b008f5277b797865273c"
};

let app;
let auth;

// Verifica si ya hay una aplicación inicializada
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  // Inicializamos auth una sola vez con persistencia para React Native
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} else {
  app = getApp();
  // Si la app ya está inicializada, obtenemos la instancia de auth existente
  auth = getAuth(app);
}

// Inicializamos Firestore de forma normal
const db = getFirestore(app);

export { app, auth, db };