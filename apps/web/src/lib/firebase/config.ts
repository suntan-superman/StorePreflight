/**
 * Firebase Configuration
 * 
 * Configuration is loaded from:
 * 1. Environment variables (for production deployments)
 * 2. Local config file (for development) - firebase.config.local.ts
 * 
 * For production, set these environment variables:
 * NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
 * NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
 * NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
 * NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
 * NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
 * NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
 */

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { firebaseLocalConfig } from "./firebase.config.local";

// Try environment variables first, fall back to local config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || firebaseLocalConfig.apiKey,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || firebaseLocalConfig.authDomain,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || firebaseLocalConfig.projectId,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || firebaseLocalConfig.storageBucket,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || firebaseLocalConfig.messagingSenderId,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || firebaseLocalConfig.appId,
};

// Initialize Firebase only once
let app: FirebaseApp | undefined;
let auth: Auth | undefined;

export function getFirebaseApp(): FirebaseApp | undefined {
  if (typeof window === "undefined") return undefined;
  
  // Check if Firebase is configured
  if (!firebaseConfig.apiKey) {
    console.warn("Firebase not configured. Auth features will be disabled.");
    return undefined;
  }

  if (!app && getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else if (!app) {
    app = getApps()[0];
  }

  return app;
}

export function getFirebaseAuth(): Auth | undefined {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return undefined;

  if (!auth) {
    auth = getAuth(firebaseApp);
  }

  return auth;
}

export function isFirebaseConfigured(): boolean {
  return Boolean(firebaseConfig.apiKey);
}
