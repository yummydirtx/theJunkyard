import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useThemeHandler } from '../useThemeHandler';

// Mock Firebase Firestore
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  setDoc: vi.fn(),
}));

// Get the mocked functions
import { doc, setDoc } from 'firebase/firestore';
const mockDoc = vi.mocked(doc);
const mockSetDoc = vi.mocked(setDoc);

describe('useThemeHandler', () => {
  const mockToggleColorMode = vi.fn();
  const mockDb = {};
  const mockActiveUser = { uid: 'test-user-id' };

  beforeEach(() => {
    vi.clearAllMocks();
    mockDoc.mockReturnValue({} as any);
  });

  it('returns handleThemeChange function', () => {
    const { result } = renderHook(() =>
      useThemeHandler({
        mode: 'light',
        toggleColorMode: mockToggleColorMode,
        activeUser: mockActiveUser,
        db: mockDb as any,
      })
    );

    expect(result.current).toHaveProperty('handleThemeChange');
    expect(typeof result.current.handleThemeChange).toBe('function');
  });

  it('calls toggleColorMode when handleThemeChange is called', async () => {
    const { result } = renderHook(() =>
      useThemeHandler({
        mode: 'light',
        toggleColorMode: mockToggleColorMode,
        activeUser: mockActiveUser,
        db: mockDb as any,
      })
    );

    await act(async () => {
      await result.current.handleThemeChange();
    });

    expect(mockToggleColorMode).toHaveBeenCalledTimes(1);
  });

  it('saves theme preference to Firestore when user is authenticated', async () => {
    mockSetDoc.mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useThemeHandler({
        mode: 'light',
        toggleColorMode: mockToggleColorMode,
        activeUser: mockActiveUser,
        db: mockDb as any,
      })
    );

    await act(async () => {
      await result.current.handleThemeChange();
    });

    expect(mockDoc).toHaveBeenCalledWith(mockDb, 'userPreferences', 'test-user-id');
    expect(mockSetDoc).toHaveBeenCalledWith({}, { theme: 'dark' }, { merge: true });
  });

  it('saves correct theme preference when switching from dark to light', async () => {
    mockSetDoc.mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useThemeHandler({
        mode: 'dark',
        toggleColorMode: mockToggleColorMode,
        activeUser: mockActiveUser,
        db: mockDb as any,
      })
    );

    await act(async () => {
      await result.current.handleThemeChange();
    });

    expect(mockSetDoc).toHaveBeenCalledWith({}, { theme: 'light' }, { merge: true });
  });

  it('does not save to Firestore when user is not authenticated', async () => {
    const { result } = renderHook(() =>
      useThemeHandler({
        mode: 'light',
        toggleColorMode: mockToggleColorMode,
        activeUser: null,
        db: mockDb as any,
      })
    );

    await act(async () => {
      await result.current.handleThemeChange();
    });

    expect(mockToggleColorMode).toHaveBeenCalledTimes(1);
    expect(mockDoc).not.toHaveBeenCalled();
    expect(mockSetDoc).not.toHaveBeenCalled();
  });

  it('does not save to Firestore when db is null', async () => {
    const { result } = renderHook(() =>
      useThemeHandler({
        mode: 'light',
        toggleColorMode: mockToggleColorMode,
        activeUser: mockActiveUser,
        db: null,
      })
    );

    await act(async () => {
      await result.current.handleThemeChange();
    });

    expect(mockToggleColorMode).toHaveBeenCalledTimes(1);
    expect(mockDoc).not.toHaveBeenCalled();
    expect(mockSetDoc).not.toHaveBeenCalled();
  });

  it('handles Firestore errors gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockSetDoc.mockRejectedValue(new Error('Firestore error'));

    const { result } = renderHook(() =>
      useThemeHandler({
        mode: 'light',
        toggleColorMode: mockToggleColorMode,
        activeUser: mockActiveUser,
        db: mockDb as any,
      })
    );

    await act(async () => {
      await result.current.handleThemeChange();
    });

    expect(mockToggleColorMode).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error saving theme preference:', expect.any(Error));

    consoleErrorSpy.mockRestore();
  });

  it('works with different user IDs', async () => {
    mockSetDoc.mockResolvedValue(undefined);
    const differentUser = { uid: 'different-user-id' };

    const { result } = renderHook(() =>
      useThemeHandler({
        mode: 'light',
        toggleColorMode: mockToggleColorMode,
        activeUser: differentUser,
        db: mockDb as any,
      })
    );

    await act(async () => {
      await result.current.handleThemeChange();
    });

    expect(mockDoc).toHaveBeenCalledWith(mockDb, 'userPreferences', 'different-user-id');
  });

  it('maintains correct theme toggle logic across multiple calls', async () => {
    mockSetDoc.mockResolvedValue(undefined);

    const { result, rerender } = renderHook(
      ({ mode }: { mode: 'light' | 'dark' }) =>
        useThemeHandler({
          mode,
          toggleColorMode: mockToggleColorMode,
          activeUser: mockActiveUser,
          db: mockDb as any,
        }),
      { initialProps: { mode: 'light' } }
    );

    // First call: light -> dark
    await act(async () => {
      await result.current.handleThemeChange();
    });

    expect(mockSetDoc).toHaveBeenCalledWith({}, { theme: 'dark' }, { merge: true });

    // Simulate mode change
    rerender({ mode: 'dark' });

    // Second call: dark -> light
    await act(async () => {
      await result.current.handleThemeChange();
    });

    expect(mockSetDoc).toHaveBeenCalledWith({}, { theme: 'light' }, { merge: true });
  });

  it('handles undefined activeUser gracefully', async () => {
    const { result } = renderHook(() =>
      useThemeHandler({
        mode: 'light',
        toggleColorMode: mockToggleColorMode,
        activeUser: undefined as any,
        db: mockDb as any,
      })
    );

    await act(async () => {
      await result.current.handleThemeChange();
    });

    expect(mockToggleColorMode).toHaveBeenCalledTimes(1);
    expect(mockDoc).not.toHaveBeenCalled();
    expect(mockSetDoc).not.toHaveBeenCalled();
  });
});
