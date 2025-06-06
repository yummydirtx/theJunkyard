import { vi } from 'vitest';

// Mock Firebase App
export const mockApp = {
  name: '[DEFAULT]',
  options: {
    apiKey: 'test-api-key',
    authDomain: 'test.firebaseapp.com',
    projectId: 'test-project',
    storageBucket: 'test-project.appspot.com',
    messagingSenderId: '123456789',
    appId: 'test-app-id',
  },
};

// Mock Firebase Auth
export const mockAuth = {
  currentUser: null,
  onAuthStateChanged: vi.fn((callback) => {
    // Simulate no user signed in initially
    setTimeout(() => callback(null), 0);
    return vi.fn(); // unsubscribe function
  }),
  signInWithEmailAndPassword: vi.fn(() => 
    Promise.resolve({
      user: {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: null,
      }
    })
  ),
  createUserWithEmailAndPassword: vi.fn(() => 
    Promise.resolve({
      user: {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: null,
      }
    })
  ),
  signInWithPopup: vi.fn(() => 
    Promise.resolve({
      user: {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: null,
      }
    })
  ),
  signOut: vi.fn(() => Promise.resolve()),
  sendPasswordResetEmail: vi.fn(() => Promise.resolve()),
  updateProfile: vi.fn(() => Promise.resolve()),
  deleteUser: vi.fn(() => Promise.resolve()),
};

// Mock Firestore
export const mockDb = {
  app: mockApp,
};

// Mock Storage
export const mockStorage = {
  app: mockApp,
};

// Mock the Firebase config module
vi.mock('../../../services/firebase/config', () => ({
  default: mockApp,
  app: mockApp,
  analytics: {},
  appCheck: {},
}));
