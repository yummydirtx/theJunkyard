import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { getAuth, onAuthStateChanged, signOut as firebaseSignOut, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children, app }) => {
    const [activeUser, setActiveUser] = useState(null); // Represents Firebase's current user
    const [loading, setLoading] = useState(true);
    const auth = getAuth(app);
    const db = getFirestore(app);

    // Listen to Firebase Auth state changes
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
                    theme: userData.theme || null, // Include theme if stored
                    // Add other relevant fields from user object or Firestore doc
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
    }, [auth, db]); // Add db dependency for fetching user prefs

    // Function to manually update parts of the activeUser state
    const updateActiveUser = useCallback((updates) => {
        setActiveUser(prevUser => {
            if (!prevUser) return null; // Should not happen if called correctly, but safe check
            return { ...prevUser, ...updates };
        });
    }, []);

    // --- Authentication Methods ---
    // These now just perform the Firebase action. onAuthStateChanged handles state updates.

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

    // Simplified Sign Out
    const signOut = useCallback(async () => {
        try {
            await firebaseSignOut(auth); // This triggers onAuthStateChanged
        } catch (error) {
            console.error("Firebase sign out error:", error);
        }
    }, [auth]);


    const value = {
        activeUser, // This is now directly from onAuthStateChanged
        loading,
        // Auth methods
        handleGoogleSignIn,
        handleEmailPasswordSignUp,
        handleEmailPasswordLogin,
        signOut, // Provide the single sign out function
        // Manual update function
        updateActiveUser, // Add the new function here
        // Pass db and auth if needed by consumers
        db,
        auth,
        app // Ensure app is exported
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
    return useContext(AuthContext);
};
