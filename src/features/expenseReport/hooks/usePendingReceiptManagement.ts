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

import { useRef, useState, useEffect, useCallback, MutableRefObject } from 'react';
import { collection, addDoc, deleteDoc, doc, serverTimestamp, Firestore } from "firebase/firestore";

interface UsePendingReceiptManagementReturn {
    unsubmittedReceiptUriRef: MutableRefObject<string | null>;
    pendingReceiptDocIdRef: MutableRefObject<string | null>;
    unsubmittedReceiptUri: string | null;
    setUnsubmittedReceiptUri: (uri: string | null) => void;
    createPendingReceiptDoc: (gsUri: string) => Promise<string>;
    deletePendingReceiptDoc: (docId: string) => Promise<void>;
}

export function usePendingReceiptManagement(
    db: Firestore, 
    activeUser: { uid: string } | null, 
    onDeleteStorageFile: (uri: string) => Promise<void>, 
    isSubmittingSuccessRef: MutableRefObject<boolean>
): UsePendingReceiptManagementReturn {
    const unsubmittedReceiptUriRef = useRef<string | null>(null);
    const pendingReceiptDocIdRef = useRef<string | null>(null);
    // Tracks the current URI being managed by the hook
    const [unsubmittedReceiptUri, setUnsubmittedReceiptUri] = useState<string | null>(null);

    const deletePendingReceiptDoc = useCallback(async (docId: string): Promise<void> => {
        if (!docId || !db || !activeUser) return;
        console.log("Hook: Deleting pending receipt document:", docId);
        try {
            await deleteDoc(doc(db, "pendingReceipts", docId));
            if (pendingReceiptDocIdRef.current === docId) {
                pendingReceiptDocIdRef.current = null;
            }
        } catch (error) {
            console.error("Hook: Error deleting pending receipt document:", docId, error);
        }
    }, [db, activeUser]);

    const createPendingReceiptDoc = useCallback(async (gsUri: string): Promise<string> => {
        if (!gsUri || !activeUser || !db) {
            console.error("Hook: Cannot create pending doc, missing gsUri, user, or db");
            throw new Error("Missing required data to create pending document.");
        }
        console.log("Hook: Creating pending receipt document for:", gsUri);
        const pendingData = {
            userId: activeUser.uid,
            gsUri: gsUri,
            uploadTimestamp: serverTimestamp()
        };
        const docRef = await addDoc(collection(db, "pendingReceipts"), pendingData);
        pendingReceiptDocIdRef.current = docRef.id;
        console.log("Hook: Pending receipt document created:", docRef.id);
        return docRef.id;
    }, [db, activeUser]);

    useEffect(() => {
        // Cleanup function on unmount or when dependencies change
        return () => {
            if (isSubmittingSuccessRef.current) {
                console.log("Hook: Cleanup skipped due to successful submission in progress.");
                return;
            }

            const uriToDelete = unsubmittedReceiptUriRef.current;
            const docIdToDelete = pendingReceiptDocIdRef.current;

            if (uriToDelete && onDeleteStorageFile) {
                console.log("Hook: Unmounting/cleaning up unsubmitted receipt file:", uriToDelete);
                onDeleteStorageFile(uriToDelete);
            }
            if (docIdToDelete) {
                console.log("Hook: Unmounting/cleaning up pending receipt doc:", docIdToDelete);
                deletePendingReceiptDoc(docIdToDelete);
            }
            unsubmittedReceiptUriRef.current = null;
            // Already cleared in deletePendingReceiptDoc if it was the same
            pendingReceiptDocIdRef.current = null;
        };
    }, [onDeleteStorageFile, deletePendingReceiptDoc, isSubmittingSuccessRef]);

    return {
        unsubmittedReceiptUriRef,
        pendingReceiptDocIdRef,
        unsubmittedReceiptUri,
        setUnsubmittedReceiptUri,
        createPendingReceiptDoc,
        deletePendingReceiptDoc,
    };
}
