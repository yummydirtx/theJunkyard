// Copyright (c) 2025 Alex Frutkin
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (theJunkyard), to deal in
// theJunkyard without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
// theJunkyard, and to permit persons to whom theJunkyard is furnished to do so,
// subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of theJunkyard.
// 
// THEJUNKYARD IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
// FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
// COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
// IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
// CONNECTION WITH THEJUNKYARD OR THE USE OR OTHER DEALINGS IN THEJUNKYARD.

import React, { createContext, useState, useEffect, useContext, useCallback, ReactNode } from 'react';
import { 
  getAuth, 
  onAuthStateChanged, 
  signOut as firebaseSignOut, 
  GoogleAuthProvider, 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  Auth,
  User as FirebaseUser,
  UserCredential
} from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, Firestore } from 'firebase/firestore';
import { FirebaseApp } from 'firebase/app';

/**
 * User profile interface representing the authenticated user's information
 */
export interface UserProfile {
  /** The user's unique ID */
  uid: string;
  /** The user's email address */
  email: string | null;
  /** The user's display name */
  displayName: string | null;
  /** URL of the user's profile picture */
  photoURL: string | null;
  /** The user's preferred theme (e.g., 'light', 'dark') */
  theme?: string | null;
}

/**
 * Authentication context type definition
 */
export interface AuthContextType {
  /** The currently authenticated user's profile, or null if not authenticated */
  activeUser: UserProfile | null;
  /** True if the authentication state is currently being determined */
  loading: boolean;
  /** Function to initiate sign-in with Google */
  handleGoogleSignIn: () => Promise<FirebaseUser>;
  /** Function to sign up with email and password */
  handleEmailPasswordSignUp: (email: string, password: string) => Promise<FirebaseUser>;
  /** Function to log in with email and password */
  handleEmailPasswordLogin: (email: string, password: string) => Promise<FirebaseUser>;
  /** Function to sign out the current user */
  signOut: () => Promise<void>;
  /** Function to manually update parts of the activeUser state */
  updateActiveUser: (updates: Partial<UserProfile>) => void;
  /** Firestore database instance */
  db: Firestore;
  /** Firebase Auth instance */
  auth: Auth;
  /** Firebase App instance */
  app: FirebaseApp;
}

/**
 * Props for the AuthProvider component
 */
interface AuthProviderProps {
  /** The child components that can access the context */
  children: ReactNode;
  /** The initialized Firebase app instance */
  app: FirebaseApp;
}

/**
 * User preferences interface for Firestore document
 */
interface UserPreferences {
  theme?: string;
  [key: string]: any;
}

/**
 * User document interface for Firestore
 */
interface UserDocument {
  email: string;
  createdAt: Date;
  [key: string]: any;
}

/**
 * React Context for authentication state.
 */
export const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Provides authentication state and methods to its children components.
 * Manages the `activeUser` and `loading` state based on Firebase Auth.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children, app }) => {
    /** The currently authenticated user object or null */
    const [activeUser, setActiveUser] = useState<UserProfile | null>(null);
    /** Indicates if the authentication state is currently being resolved */
    const [loading, setLoading] = useState<boolean>(true);
    const auth = getAuth(app);
    const db = getFirestore(app);

    // Listen to Firebase Auth state changes and update activeUser and loading states.
    useEffect(() => {
        setLoading(true);
        const unsubscribe = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
            if (user) {
                // User is signed in
                // Store minimal user info, fetch more if needed (like theme)
                const userRef = doc(db, "userPreferences", user.uid);
                
                try {
                    const userSnap = await getDoc(userRef);
                    const userData: UserPreferences = userSnap.exists() ? userSnap.data() as UserPreferences : {};

                    setActiveUser({
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName,
                        photoURL: user.photoURL,
                        theme: userData.theme || null,
                    });
                } catch (error) {
                    console.error('Error fetching user preferences:', error);
                    // Set user without preferences if there's an error
                    setActiveUser({
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName,
                        photoURL: user.photoURL,
                        theme: null,
                    });
                }
            } else {
                // User is signed out
                setActiveUser(null);
            }
            setLoading(false);
        });

        // Cleanup subscription on unmount
        return () => {
            unsubscribe();
        };
    }, [auth, db]);

    /**
     * Callback function to manually update properties of the `activeUser` state.
     */
    const updateActiveUser = useCallback((updates: Partial<UserProfile>): void => {
        setActiveUser(prevUser => {
            if (!prevUser) return null; // Should not happen if called correctly, but safe check
            return { ...prevUser, ...updates };
        });
    }, []);

    /**
     * Handles sign-in with Google.
     * @throws {Error} If sign-in fails.
     */
    const handleGoogleSignIn = async (): Promise<FirebaseUser> => {
        const provider = new GoogleAuthProvider();
        try {
            // signInWithPopup will trigger onAuthStateChanged
            const result: UserCredential = await signInWithPopup(auth, provider);
            
            // Optional: Check/create user doc immediately if needed
            const userDocRef = doc(db, 'users', result.user.uid);
            const userDoc = await getDoc(userDocRef);
            if (!userDoc.exists()) {
                const userDocData: UserDocument = { 
                    email: result.user.email || '', 
                    createdAt: new Date() 
                };
                await setDoc(userDocRef, userDocData);
            }
            
            return result.user;
        } catch (error) {
            console.error("Google Sign In Error:", error);
            throw error;
        }
    };

    /**
     * Handles user sign-up with email and password.
     * @throws {Error} If sign-up fails.
     */
    const handleEmailPasswordSignUp = async (email: string, password: string): Promise<FirebaseUser> => {
        try {
            // createUserWithEmailAndPassword will trigger onAuthStateChanged
            const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
            
            // Optional: Check/create user doc immediately
            const userDocRef = doc(db, 'users', userCredential.user.uid);
            const userDoc = await getDoc(userDocRef);
            if (!userDoc.exists()) {
                const userDocData: UserDocument = { 
                    email: userCredential.user.email || '', 
                    createdAt: new Date() 
                };
                await setDoc(userDocRef, userDocData);
            }
            
            return userCredential.user;
        } catch (error) {
            console.error("Email Sign Up Error:", error);
            throw error;
        }
    };

    /**
     * Handles user login with email and password.
     * @throws {Error} If login fails.
     */
    const handleEmailPasswordLogin = async (email: string, password: string): Promise<FirebaseUser> => {
        try {
            // signInWithEmailAndPassword will trigger onAuthStateChanged
            const userCredential: UserCredential = await signInWithEmailAndPassword(auth, email, password);
            return userCredential.user;
        } catch (error) {
            console.error("Email Log In Error:", error);
            throw error;
        }
    };

    /**
     * Signs out the currently authenticated user.
     */
    const signOut = useCallback(async (): Promise<void> => {
        try {
            await firebaseSignOut(auth); // This triggers onAuthStateChanged
        } catch (error) {
            console.error("Firebase sign out error:", error);
        }
    }, [auth]);

    const value: AuthContextType = {
        activeUser,
        loading,
        handleGoogleSignIn,
        handleEmailPasswordSignUp,
        handleEmailPasswordLogin,
        signOut,
        updateActiveUser,
        db,
        auth,
        app
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to easily access the AuthContext.
 * @throws {Error} If used outside of an AuthProvider.
 */
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined || context === null) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
