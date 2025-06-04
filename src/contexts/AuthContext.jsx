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

import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { getAuth, onAuthStateChanged, signOut as firebaseSignOut, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

/**
 * @typedef {object} UserProfile
 * @property {string} uid - The user's unique ID.
 * @property {string|null} email - The user's email address.
 * @property {string|null} displayName - The user's display name.
 * @property {string|null} photoURL - URL of the user's profile picture.
 * @property {string|null} theme - The user's preferred theme (e.g., 'light', 'dark').
 */

/**
 * @typedef {object} AuthContextType
 * @property {UserProfile|null} activeUser - The currently authenticated user's profile, or null if not authenticated.
 * @property {boolean} loading - True if the authentication state is currently being determined.
 * @property {function} handleGoogleSignIn - Function to initiate sign-in with Google.
 * @property {function} handleEmailPasswordSignUp - Function to sign up with email and password.
 * @property {function} handleEmailPasswordLogin - Function to log in with email and password.
 * @property {function} signOut - Function to sign out the current user.
 * @property {function} updateActiveUser - Function to manually update parts of the activeUser state.
 * @property {object} db - Firestore database instance.
 * @property {object} auth - Firebase Auth instance.
 * @property {import('firebase/app').FirebaseApp} app - Firebase App instance.
 */

/**
 * React Context for authentication state.
 * @type {React.Context<AuthContextType|null>}
 */
export const AuthContext = createContext(null);

/**
 * Provides authentication state and methods to its children components.
 * Manages the `activeUser` and `loading` state based on Firebase Auth.
 * @param {object} props - The component's props.
 * @param {React.ReactNode} props.children - The child components that can access the context.
 * @param {import('firebase/app').FirebaseApp} props.app - The initialized Firebase app instance.
 */
export const AuthProvider = ({ children, app }) => {
    /** @state {UserProfile|null} activeUser - The currently authenticated user object or null. */
    const [activeUser, setActiveUser] = useState(null);
    /** @state {boolean} loading - Indicates if the authentication state is currently being resolved. */
    const [loading, setLoading] = useState(true);
    const auth = getAuth(app);
    const db = getFirestore(app);

    // Listen to Firebase Auth state changes and update activeUser and loading states.
    useEffect(() => {
        setLoading(true);
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // User is signed in
                // console.log('[AuthContext] onAuthStateChanged: User signed in:', user.uid);
                // Store minimal user info, fetch more if needed (like theme)
                const userRef = doc(db, "userPreferences", user.uid);
                const userSnap = await getDoc(userRef);
                const userData = userSnap.exists() ? userSnap.data() : {};

                setActiveUser({
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                    theme: userData.theme || null,
                });
            } else {
                // User is signed out
                // console.log('[AuthContext] onAuthStateChanged: User signed out.');
                setActiveUser(null);
            }
            setLoading(false);
        });

        // Cleanup subscription on unmount
        return () => {
            // console.log('[AuthContext] Cleaning up onAuthStateChanged listener.');
            unsubscribe();
        }
    }, [auth, db]); // db dependency for fetching user prefs

    /**
     * Callback function to manually update properties of the `activeUser` state.
     * @param {Partial<UserProfile>} updates - An object containing the properties of `activeUser` to update.
     */
    const updateActiveUser = useCallback((updates) => {
        setActiveUser(prevUser => {
            if (!prevUser) return null; // Should not happen if called correctly, but safe check
            return { ...prevUser, ...updates };
        });
    }, []);

    /**
     * Handles sign-in with Google.
     * @async
     * @returns {Promise<object|null>} Firebase user object on success, null on failure.
     * @throws {Error} If sign-in fails.
     */
    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        try {
            // signInWithPopup will trigger onAuthStateChanged
            const result = await signInWithPopup(auth, provider);
            // Optional: Check/create user doc immediately if needed, though onAuthStateChanged could also handle this
            const userDocRef = doc(db, 'users', result.user.uid); // Example path
            const userDoc = await getDoc(userDocRef);
            if (!userDoc.exists()) {
                 await setDoc(userDocRef, { email: result.user.email, createdAt: new Date() });
            }
            return result.user;
        } catch (error) {
            console.error("Google Sign In Error:", error);
            throw error;
        }
    };

    /**
     * Handles user sign-up with email and password.
     * @async
     * @param {string} email - The user's email.
     * @param {string} password - The user's password.
     * @returns {Promise<object|null>} Firebase user object on success, null on failure.
     * @throws {Error} If sign-up fails.
     */
    const handleEmailPasswordSignUp = async (email, password) => {
        try {
            // createUserWithEmailAndPassword will trigger onAuthStateChanged
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            // Optional: Check/create user doc immediately
            const userDocRef = doc(db, 'users', userCredential.user.uid); // Example path
            const userDoc = await getDoc(userDocRef);
            if (!userDoc.exists()) {
                await setDoc(userDocRef, { email: userCredential.user.email, createdAt: new Date() });
            }
            return userCredential.user;
        } catch (error) {
            console.error("Email Sign Up Error:", error);
            throw error;
        }
    };

    /**
     * Handles user login with email and password.
     * @async
     * @param {string} email - The user's email.
     * @param {string} password - The user's password.
     * @returns {Promise<object|null>} Firebase user object on success, null on failure.
     * @throws {Error} If login fails.
     */
    const handleEmailPasswordLogin = async (email, password) => {
        try {
            // signInWithEmailAndPassword will trigger onAuthStateChanged
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return userCredential.user;
        } catch (error) {
            console.error("Email Log In Error:", error);
            throw error;
        }
    };

    /**
     * Signs out the currently authenticated user.
     * @async
     */
    const signOut = useCallback(async () => {
        try {
            await firebaseSignOut(auth); // This triggers onAuthStateChanged
        } catch (error) {
            console.error("Firebase sign out error:", error);
        }
    }, [auth]);


    const value = {
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
 * @returns {AuthContextType} The authentication context value.
 * @throws {Error} If used outside of an AuthProvider.
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined || context === null) { // Check for null as well
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
