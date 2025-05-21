// Copyright (c) 2025 Alex Frutkin
// ... (license details) ...

import { useRef, useState, useEffect, useCallback } from 'react';
import { collection, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";

export function usePendingReceiptManagement(db, activeUser, onDeleteStorageFile, isSubmittingSuccessRef) {
    const unsubmittedReceiptUriRef = useRef(null);
    const pendingReceiptDocIdRef = useRef(null);
    const [unsubmittedReceiptUri, setUnsubmittedReceiptUri] = useState(null); // Tracks the current URI being managed by the hook

    const deletePendingReceiptDoc = useCallback(async (docId) => {
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

    const createPendingReceiptDoc = useCallback(async (gsUri) => {
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
            pendingReceiptDocIdRef.current = null; // Already cleared in deletePendingReceiptDoc if it was the same
        };
    }, [onDeleteStorageFile, deletePendingReceiptDoc, isSubmittingSuccessRef]); // db, activeUser are stable or part of deletePendingReceiptDoc's deps

    return {
        unsubmittedReceiptUriRef,
        pendingReceiptDocIdRef,
        unsubmittedReceiptUri,
        setUnsubmittedReceiptUri,
        createPendingReceiptDoc,
        deletePendingReceiptDoc,
    };
}
