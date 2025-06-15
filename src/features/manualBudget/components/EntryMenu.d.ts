import { BudgetEntry } from '../types/types';

interface EntryMenuProps {
  entry: BudgetEntry;
  db?: any;
  user?: any;
  currentMonth: string;
  selectedCategory: string;
  onEntryUpdated: () => void;
  mode: string;
  updateEntry?: (data: any) => void;
  deleteEntry?: (id: string) => void;
}

declare const EntryMenu: React.FC<EntryMenuProps>;
export default EntryMenu;
