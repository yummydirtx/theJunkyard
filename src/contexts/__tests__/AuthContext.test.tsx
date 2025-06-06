import React from 'react';
import { render, act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom'; // Assuming this or a similar setup for DOM matchers with Vitest
import { AuthProvider, useAuth } from '../AuthContext';
import { FirebaseApp } from 'firebase/app';
import { Auth, User as FirebaseUser, UserCredential } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { vi } from 'vitest';

// --- Mocks ---
const mockFirebaseApp = {} as FirebaseApp;

const mockAuthedUser: FirebaseUser = {
  uid: 'test-uid-123',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: 'https://example.com/avatar.jpg',
  // Required FirebaseUser properties (can be dummy values if not used)
  emailVerified: true,
  isAnonymous: false,
  metadata: {},
  providerData: [],
  providerId: 'firebase',
  refreshToken: 'mockRefreshToken',
  tenantId: null,
  delete: vi.fn(),
  getIdToken: vi.fn(),
  getIdTokenResult: vi.fn(),
  reload: vi.fn(),
  toJSON: vi.fn(),
} as unknown as FirebaseUser; // Using unknown for broader compatibility with FirebaseUser type

const mockUserCredential = {
  user: mockAuthedUser,
} as UserCredential;

let onAuthStateChangedCallback: ((user: FirebaseUser | null) => void) | null = null;
const mockUnsubscribe = vi.fn();

const mockGetAuth = vi.fn();
const mockFirebaseAuthSignOut = vi.fn().mockResolvedValue(undefined);
const mockSignInWithPopup = vi.fn().mockResolvedValue(mockUserCredential);
const mockCreateUserWithEmailAndPassword = vi.fn().mockResolvedValue(mockUserCredential);
const mockSignInWithEmailAndPassword = vi.fn().mockResolvedValue(mockUserCredential);

const mockGetFirestore = vi.fn();
const mockDoc = vi.fn();
const mockGetDoc = vi.fn();
const mockSetDoc = vi.fn().mockResolvedValue(undefined);

vi.mock('firebase/auth', () => ({
  getAuth: (app: FirebaseApp) => mockGetAuth(app),
  onAuthStateChanged: (auth: Auth, callback: (user: FirebaseUser | null) => void) => {
    onAuthStateChangedCallback = callback;
    return mockUnsubscribe;
  },
  signOut: (auth: Auth) => mockFirebaseAuthSignOut(auth),
  GoogleAuthProvider: vi.fn(),
  signInWithPopup: (auth: Auth, provider: any) => mockSignInWithPopup(auth, provider),
  createUserWithEmailAndPassword: (auth: Auth, email: string, pass: string) =>
    mockCreateUserWithEmailAndPassword(auth, email, pass),
  signInWithEmailAndPassword: (auth: Auth, email: string, pass: string) =>
    mockSignInWithEmailAndPassword(auth, email, pass),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: (app: FirebaseApp) => mockGetFirestore(app),
  doc: (...args: any[]) => mockDoc(...args),
  getDoc: (docRef: any) => mockGetDoc(docRef),
  setDoc: (docRef: any, data: any) => mockSetDoc(docRef, data),
}));

const TestConsumerComponent = () => {
  const auth = useAuth();
  if (auth.loading) return <div>Loading...</div>;
  if (!auth.activeUser) return <div>No user</div>;
  return (
    <div>
      <div data-testid="uid">{auth.activeUser.uid}</div>
      <div data-testid="email">{auth.activeUser.email}</div>
      <div data-testid="displayName">{auth.activeUser.displayName}</div>
      <div data-testid="photoURL">{auth.activeUser.photoURL}</div>
      <div data-testid="theme">{auth.activeUser.theme || 'no-theme'}</div>
      <button onClick={auth.signOut}>Sign Out</button>
      <button onClick={() => auth.updateActiveUser({ theme: 'dark-test' })}>Update Theme</button>
    </div>
  );
};

const renderAuthProvider = () => {
  return render(
    <AuthProvider app={mockFirebaseApp}>
      <TestConsumerComponent />
    </AuthProvider>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    onAuthStateChangedCallback = null;
    mockGetAuth.mockReturnValue({} as Auth);
    mockGetFirestore.mockReturnValue({} as Firestore);
    mockDoc.mockImplementation((db, collection, id) => `mockDocRef/${collection}/${id}`);
    mockGetDoc.mockResolvedValue({ exists: () => false, data: () => undefined }); // Default: no user preferences
  });

  test('initial state shows loading', () => {
    renderAuthProvider();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  describe('onAuthStateChanged', () => {
    test('sets activeUser and stops loading when user signs in (no preferences)', async () => {
      renderAuthProvider();
      expect(screen.getByText('Loading...')).toBeInTheDocument();

      await act(async () => {
        if (onAuthStateChangedCallback) onAuthStateChangedCallback(mockAuthedUser);
      });

      await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());
      expect(screen.getByTestId('uid')).toHaveTextContent(mockAuthedUser.uid);
      expect(screen.getByTestId('email')).toHaveTextContent(mockAuthedUser.email!);
      expect(screen.getByTestId('theme')).toHaveTextContent('no-theme');
      expect(mockGetDoc).toHaveBeenCalledWith(`mockDocRef/userPreferences/${mockAuthedUser.uid}`);
    });

    test('sets activeUser with theme when user signs in and preferences exist', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ theme: 'dark' }),
      });
      renderAuthProvider();
      await act(async () => {
        if (onAuthStateChangedCallback) onAuthStateChangedCallback(mockAuthedUser);
      });
      await waitFor(() => expect(screen.getByTestId('theme')).toHaveTextContent('dark'));
    });

    test('sets activeUser with null theme if fetching preferences fails', async () => {
      mockGetDoc.mockRejectedValue(new Error('Firestore error'));
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      renderAuthProvider();
      await act(async () => {
        if (onAuthStateChangedCallback) onAuthStateChangedCallback(mockAuthedUser);
      });
      await waitFor(() => expect(screen.getByTestId('theme')).toHaveTextContent('no-theme'));
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching user preferences:', expect.any(Error));
      consoleErrorSpy.mockRestore();
    });

    test('sets activeUser to null and stops loading when user signs out', async () => {
      renderAuthProvider();
      await act(async () => {
        if (onAuthStateChangedCallback) onAuthStateChangedCallback(mockAuthedUser);
      });
      await waitFor(() => expect(screen.getByTestId('uid')).toBeInTheDocument());
      await act(async () => {
        if (onAuthStateChangedCallback) onAuthStateChangedCallback(null);
      });
      await waitFor(() => expect(screen.getByText('No user')).toBeInTheDocument());
    });
  });

  describe('Sign Out', () => {
    test('signOut method calls firebaseSignOut', async () => {
      renderAuthProvider();
      await act(async () => { if (onAuthStateChangedCallback) onAuthStateChangedCallback(mockAuthedUser); });
      await waitFor(() => screen.getByTestId('uid'));
      
      const signOutButton = screen.getByText('Sign Out');
      await act(async () => {
        await userEvent.click(signOutButton);
      });
      expect(mockFirebaseAuthSignOut).toHaveBeenCalled();
    });

    test('signOut method handles errors from firebaseSignOut', async () => {
      mockFirebaseAuthSignOut.mockRejectedValueOnce(new Error('Firebase sign out failed'));
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      renderAuthProvider();
      await act(async () => { if (onAuthStateChangedCallback) onAuthStateChangedCallback(mockAuthedUser); });
      await waitFor(() => screen.getByTestId('uid'));

      const signOutButton = screen.getByText('Sign Out');
      await act(async () => {
        await userEvent.click(signOutButton);
      });
      expect(mockFirebaseAuthSignOut).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith("Firebase sign out error:", expect.any(Error));
      consoleErrorSpy.mockRestore();
    });
  });
  
  test('updateActiveUser updates the activeUser state', async () => {
    renderAuthProvider();
    await act(async () => { if (onAuthStateChangedCallback) onAuthStateChangedCallback(mockAuthedUser); });
    await waitFor(() => expect(screen.getByTestId('theme')).toHaveTextContent('no-theme'));

    const updateButton = screen.getByText('Update Theme');
    await act(async () => {
      await userEvent.click(updateButton);
    });
    await waitFor(() => expect(screen.getByTestId('theme')).toHaveTextContent('dark-test'));
  });

  describe('Sign-in methods', () => {
    const testEmail = 'new@example.com';
    const testPassword = 'password123';
    const newMockUser = { ...mockAuthedUser, email: testEmail, uid: 'new-uid-456' } as FirebaseUser;
    const newMockUserCredential = { user: newMockUser } as UserCredential;

    let contextAuth: any;
    const AuthConsumerForMethods = () => { contextAuth = useAuth(); return null; };

    beforeEach(() => {
      // Reset sign-in mocks to return the new user for email/pass, original for Google
      mockSignInWithPopup.mockResolvedValue(mockUserCredential); // Google uses original mockAuthedUser
      mockCreateUserWithEmailAndPassword.mockResolvedValue(newMockUserCredential);
      mockSignInWithEmailAndPassword.mockResolvedValue(newMockUserCredential);
      
      mockGetDoc.mockImplementation(docPath => {
        // For 'users' collection, default to not existing
        if (typeof docPath === 'string' && docPath.startsWith('mockDocRef/users/')) {
          return Promise.resolve({ exists: () => false, data: () => undefined });
        }
        // For 'userPreferences', default to not existing
        if (typeof docPath === 'string' && docPath.startsWith('mockDocRef/userPreferences/')) {
          return Promise.resolve({ exists: () => false, data: () => undefined });
        }
        return Promise.resolve({ exists: () => false, data: () => undefined });
      });
      mockSetDoc.mockClear();
      render(<AuthProvider app={mockFirebaseApp}><AuthConsumerForMethods /></AuthProvider>);
      // Ensure loading is false and no user initially for method tests
      act(() => { if (onAuthStateChangedCallback) onAuthStateChangedCallback(null); });
    });

    test('handleGoogleSignIn success (new user)', async () => {
      await act(async () => {
        await contextAuth.handleGoogleSignIn();
      });
      expect(mockSignInWithPopup).toHaveBeenCalled();
      expect(mockDoc).toHaveBeenCalledWith(expect.anything(), 'users', mockAuthedUser.uid);
      expect(mockGetDoc).toHaveBeenCalledWith(`mockDocRef/users/${mockAuthedUser.uid}`);
      expect(mockSetDoc).toHaveBeenCalledWith(
        `mockDocRef/users/${mockAuthedUser.uid}`,
        { email: mockAuthedUser.email, createdAt: expect.any(Date) }
      );
    });

    test('handleGoogleSignIn success (existing user)', async () => {
      mockGetDoc.mockImplementation(docPath => {
        if (docPath === `mockDocRef/users/${mockAuthedUser.uid}`) {
          return Promise.resolve({ exists: () => true, data: () => ({ email: mockAuthedUser.email }) });
        }
        return Promise.resolve({ exists: () => false, data: () => undefined });
      });
      await act(async () => {
        await contextAuth.handleGoogleSignIn();
      });
      expect(mockSignInWithPopup).toHaveBeenCalled();
      expect(mockGetDoc).toHaveBeenCalledWith(`mockDocRef/users/${mockAuthedUser.uid}`);
      expect(mockSetDoc).not.toHaveBeenCalled();
    });
    
    test('handleGoogleSignIn failure', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockSignInWithPopup.mockRejectedValueOnce(new Error('Google Sign In Failed'));
      await expect(contextAuth.handleGoogleSignIn()).rejects.toThrow('Google Sign In Failed');
      expect(consoleErrorSpy).toHaveBeenCalledWith("Google Sign In Error:", expect.any(Error));
      consoleErrorSpy.mockRestore();
    });

    test('handleEmailPasswordSignUp success (new user)', async () => {
      await act(async () => {
        await contextAuth.handleEmailPasswordSignUp(testEmail, testPassword);
      });
      expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), testEmail, testPassword);
      expect(mockDoc).toHaveBeenCalledWith(expect.anything(), 'users', newMockUser.uid);
      expect(mockGetDoc).toHaveBeenCalledWith(`mockDocRef/users/${newMockUser.uid}`);
      expect(mockSetDoc).toHaveBeenCalledWith(
        `mockDocRef/users/${newMockUser.uid}`,
        { email: newMockUser.email, createdAt: expect.any(Date) }
      );
    });
    
    test('handleEmailPasswordSignUp failure', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockCreateUserWithEmailAndPassword.mockRejectedValueOnce(new Error('Email Sign Up Failed'));
      await expect(contextAuth.handleEmailPasswordSignUp(testEmail, testPassword)).rejects.toThrow('Email Sign Up Failed');
      expect(consoleErrorSpy).toHaveBeenCalledWith("Email Sign Up Error:", expect.any(Error));
      consoleErrorSpy.mockRestore();
    });

    test('handleEmailPasswordLogin success', async () => {
      await act(async () => {
        await contextAuth.handleEmailPasswordLogin(testEmail, testPassword);
      });
      expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), testEmail, testPassword);
      expect(mockSetDoc).not.toHaveBeenCalledWith(expect.stringContaining('users'), expect.anything());
    });

    test('handleEmailPasswordLogin failure', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockSignInWithEmailAndPassword.mockRejectedValueOnce(new Error('Email Log In Failed'));
      await expect(contextAuth.handleEmailPasswordLogin(testEmail, testPassword)).rejects.toThrow('Email Log In Failed');
      expect(consoleErrorSpy).toHaveBeenCalledWith("Email Log In Error:", expect.any(Error));
      consoleErrorSpy.mockRestore();
    });
  });

  describe('useAuth hook', () => {
    test('provides context value when used within AuthProvider', () => {
      let contextValue: any;
      const Consumer = () => { contextValue = useAuth(); return null; };
      render(<AuthProvider app={mockFirebaseApp}><Consumer /></AuthProvider>);
      expect(contextValue).toBeDefined();
      expect(contextValue.activeUser).toBeNull();
      expect(contextValue.loading).toBe(true);
    });

    test('throws error when used outside AuthProvider', () => {
      const originalError = console.error;
      console.error = vi.fn(); // Suppress React error boundary message
      const ConsumerOutsideProvider = () => { useAuth(); return null; };
      expect(() => render(<ConsumerOutsideProvider />)).toThrow('useAuth must be used within an AuthProvider');
      console.error = originalError;
    });
  });
});
