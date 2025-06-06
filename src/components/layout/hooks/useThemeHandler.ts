import { doc, setDoc, Firestore } from 'firebase/firestore';

interface UseThemeHandlerProps {
  mode: 'light' | 'dark';
  toggleColorMode: () => void;
  activeUser: any;
  db: Firestore | null;
}

export const useThemeHandler = ({ mode, toggleColorMode, activeUser, db }: UseThemeHandlerProps) => {
  const handleThemeChange = async () => {
    toggleColorMode();
    if (activeUser && db) {
      try {
        const newMode = mode === 'light' ? 'dark' : 'light';
        await setDoc(doc(db, 'userPreferences', activeUser.uid), {
          theme: newMode
        }, { merge: true });
      } catch (error) {
        console.error("Error saving theme preference:", error);
      }
    }
  };

  return { handleThemeChange };
};
