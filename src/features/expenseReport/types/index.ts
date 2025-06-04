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

export interface ExpenseItem {
  name?: string; // Legacy field
  description?: string; // Correct field name
  price: number;
  quantity?: number;
}

export interface Expense {
  id: string;
  userId: string;
  amount: number;
  totalAmount?: number; // Legacy field for backwards compatibility
  description: string;
  date: string;
  category?: string;
  status: 'pending' | 'approved' | 'denied' | 'reimbursed';
  items?: ExpenseItem[];
  receiptUri?: string;
  receiptFileName?: string;
  submittedAt: Date;
  updatedAt: Date;
  processedAt?: Date;
  denialReason?: string | null;
  notes?: string;
}

export interface SharedExpenseReport {
  id: string;
  userId: string;
  expenses: Expense[];
  shareLink: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

export interface ReceiptProcessingResult {
  totalAmount: number;
  transactionSummary: string;
  items: ExpenseItem[];
  confidence: number;
}

export interface ShareLinkData {
  shareId: string;
  userId: string;
  expenses: Expense[];
  generatedAt: Date;
  isActive: boolean;
}

// Props interfaces for components
export interface ExpenseReportProps {
  setMode: (mode: 'light' | 'dark') => void;
  mode: 'light' | 'dark';
}

export interface ExpenseFormProps {
  onAddExpense: (expenseData: Omit<Expense, 'id' | 'userId' | 'submittedAt' | 'updatedAt'>) => Promise<void>;
  onDeleteStorageFile: (fileName: string) => Promise<void>;
}

export interface ExpenseListProps {
  expenses: Expense[];
  onDeleteExpense: (expenseId: string) => Promise<void>;
  onEditExpense: (expense: Expense) => void;
  onUpdateStatus: (expenseId: string, newStatus: Expense['status']) => Promise<void>;
  handleMenuOpen: (event: React.MouseEvent<HTMLElement>, expenseId: string) => void;
  handleMenuClose: () => void;
  anchorEl: HTMLElement | null;
  menuExpenseId: string | null;
  handleMenuExited: () => void;
}

export interface ExpenseTotalProps {
  totalAmount: number;
}

export interface ShareLinkManagerProps {
  shareLink: string;
  generateLink: () => Promise<void>;
  generatingLink: boolean;
  linkError: string | null;
  copyToClipboard: (text: string) => void;
  copied: boolean;
  disabled: boolean;
}

export interface EditExpenseModalProps {
  open: boolean;
  onClose: () => void;
  expense: Expense | null;
  onSave: (expenseId: string, updatedData: Partial<Expense>) => Promise<void>;
}

export interface ReceiptUploadProps {
  onReceiptProcessed: (result: ReceiptProcessingResult) => void;
  onReceiptUploaded: (fileName: string, downloadUrl: string) => void;
  onDeleteStorageFile: (fileName: string) => Promise<void>;
  disabled?: boolean;
}

export interface ParsedItemsListProps {
  items: ExpenseItem[];
  onItemsChange: (items: ExpenseItem[]) => void;
  canEdit?: boolean;
}

export interface FormHeaderProps {
  title?: string;
  subtitle?: string;
  isExpanded?: boolean;
  toggleExpand?: () => void;
}

export interface SharedExpenseReportProps {
  mode: 'light' | 'dark';
  setMode: (mode: 'light' | 'dark') => void;
}

export interface DenialReasonModalProps {
  open: boolean;
  onClose: () => void;
  reason: string;
  onReasonChange: (reason: string) => void;
  onConfirm: () => void;
}

export interface SharedExpenseActionsProps {
  updating: boolean;
  updateError: string | null;
  updateSuccess: string | null;
  onMarkReimbursed: () => void;
  onOpenDenialModal: () => void;
  selectedCount: number;
}

export interface ExpenseListItemContentProps {
  expense: Expense;
  showDenialReason?: boolean;
  isSharedView?: boolean;
}

// Hook return types
export interface UseShareLinkReturn {
  shareLink: string;
  generateLink: () => Promise<void>;
  generatingLink: boolean;
  linkError: string;
  copyToClipboard: () => void;
  copied: boolean;
}

export interface UseUserExpensesReturn {
  expenses: Expense[];
  loadingExpenses: boolean;
  addExpense: (newExpense: NewExpenseData) => Promise<void>;
  deleteExpense: (expenseId: string) => Promise<void>;
  updateExpense: (expenseId: string, updatedData: Partial<Expense>) => Promise<void>;
  deleteStorageFile: (gsUri: string) => Promise<void>;
  totalPendingAmount: number;
}

export interface NewExpenseData {
  description: string;
  amount: number;
  receiptUri?: string;
  items?: ExpenseItem[];
}

export interface ModalState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export interface EditExpenseModalState {
  isOpen: boolean;
  open: (expense: Expense) => void;
  close: () => void;
  expenseToEdit: Expense | null;
}

export interface UseExpenseReportModalsReturn {
  loginModal: ModalState;
  signUpModal: ModalState;
  editExpenseModal: EditExpenseModalState;
}

export interface UseSharedExpensesReturn {
  sharedExpenses: Expense[];
  loadingSharedExpenses: boolean;
  updateExpenseStatus: (expenseId: string, newStatus: Expense['status'], denialReason?: string) => Promise<void>;
  updating: boolean;
  updateError: string | null;
  updateSuccess: string | null;
}

export interface UsePendingReceiptManagementReturn {
  pendingReceipts: PendingReceipt[];
  loadingPendingReceipts: boolean;
  deletePendingReceipt: (receiptId: string) => Promise<void>;
  addPendingReceipt: (receipt: Omit<PendingReceipt, 'id' | 'createdAt'>) => Promise<void>;
}

export interface PendingReceipt {
  id: string;
  fileName: string;
  downloadUrl: string;
  processingResult?: ReceiptProcessingResult;
  createdAt: Date;
}

export interface UseReceiptProcessorReturn {
  processReceipt: (file: File) => Promise<ReceiptProcessingResult>;
  processing: boolean;
  processingError: string | null;
}

export interface UseExpenseReportServiceReturn {
  expenses: Expense[];
  loadingExpenses: boolean;
  addExpense: (expenseData: NewExpenseData) => Promise<void>;
  deleteExpense: (expenseId: string) => Promise<void>;
  updateExpense: (expenseId: string, updatedData: Partial<Expense>) => Promise<void>;
  deleteStorageFile: (fileName: string) => Promise<void>;
  totalPendingAmount: number;
  generateShareLink: () => Promise<string>;
  getSharedExpenses: (shareId: string) => Promise<Expense[]>;
  updateExpenseStatus: (shareId: string, expenseId: string, status: Expense['status'], denialReason?: string) => Promise<void>;
}
