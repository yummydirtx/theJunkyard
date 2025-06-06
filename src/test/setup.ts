import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window.open
Object.defineProperty(window, 'open', {
  writable: true,
  value: vi.fn(),
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation((callback, options) => ({
  root: null,
  rootMargin: '0px',
  thresholds: [0],
  disconnect: vi.fn(),
  observe: vi.fn(),
  unobserve: vi.fn(),
  takeRecords: vi.fn(() => []),
})) as any;

// Mock Firebase modules before any imports
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({
    name: '[DEFAULT]',
    options: {},
  })),
  getApps: vi.fn(() => []),
  getApp: vi.fn(() => ({
    name: '[DEFAULT]',
    options: {},
  })),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({
    currentUser: null,
    onAuthStateChanged: vi.fn(),
    signInWithEmailAndPassword: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
    signInWithPopup: vi.fn(),
    signOut: vi.fn(),
    sendPasswordResetEmail: vi.fn(),
    updateProfile: vi.fn(),
    deleteUser: vi.fn(),
  })),
  onAuthStateChanged: vi.fn((auth, callback) => {
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
  GoogleAuthProvider: vi.fn(() => ({
    providerId: 'google.com',
  })),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({
    app: { name: '[DEFAULT]' },
  })),
  doc: vi.fn((db, path, id) => ({ 
    id, 
    path: `${path}/${id}`,
    firestore: db 
  })),
  getDoc: vi.fn(() => 
    Promise.resolve({
      exists: () => true,
      data: () => ({ name: 'Test User', email: 'test@example.com' }),
    })
  ),
  setDoc: vi.fn(() => Promise.resolve()),
  updateDoc: vi.fn(() => Promise.resolve()),
  deleteDoc: vi.fn(() => Promise.resolve()),
  collection: vi.fn((db, path) => ({ 
    path, 
    firestore: db 
  })),
  getDocs: vi.fn(() => 
    Promise.resolve({
      docs: [],
      empty: true,
      size: 0,
    })
  ),
  addDoc: vi.fn(() => 
    Promise.resolve({ 
      id: 'test-doc-id' 
    })
  ),
  query: vi.fn((collection, ...constraints) => ({ 
    collection, 
    constraints 
  })),
  where: vi.fn((field, operator, value) => ({ 
    field, 
    operator, 
    value 
  })),
  orderBy: vi.fn((field, direction) => ({ 
    field, 
    direction 
  })),
  limit: vi.fn((count) => ({ count })),
}));

vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(() => ({
    app: { name: '[DEFAULT]' },
  })),
  ref: vi.fn((storage, path) => ({ 
    fullPath: path,
    storage 
  })),
  uploadBytes: vi.fn(() => 
    Promise.resolve({
      metadata: {
        name: 'test-file.jpg',
        fullPath: 'test-path/test-file.jpg',
      },
    })
  ),
  getDownloadURL: vi.fn(() => 
    Promise.resolve('https://example.com/test-file.jpg')
  ),
  deleteObject: vi.fn(() => Promise.resolve()),
}));

vi.mock('firebase/analytics', () => ({
  getAnalytics: vi.fn(() => ({})),
  logEvent: vi.fn(),
}));

vi.mock('firebase/app-check', () => ({
  initializeAppCheck: vi.fn(() => ({})),
  ReCaptchaV3Provider: vi.fn(() => ({})),
}));
