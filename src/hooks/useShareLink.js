import { useState, useCallback } from 'react';
import { getFunctions, httpsCallable } from "firebase/functions";
import { getAuth } from "firebase/auth";
import { useAuth } from '../contexts/AuthContext';

export function useShareLink() {
    const { activeUser, app } = useAuth();
    const functions = getFunctions(app);
    const auth = getAuth(app);

    const [shareLink, setShareLink] = useState('');
    const [generatingLink, setGeneratingLink] = useState(false);
    const [linkError, setLinkError] = useState('');
    const [copied, setCopied] = useState(false);

    const generateLink = useCallback(async () => {
        if (!activeUser || !functions || !auth.currentUser) {
            setLinkError("Cannot generate link: User not logged in or services unavailable.");
            return;
        }
        setGeneratingLink(true);
        setLinkError('');
        setShareLink('');
        setCopied(false);
        try {
             console.log("Calling generateExpenseReportShareLink function...");
            const generateLinkFunction = httpsCallable(functions, 'generateExpenseReportShareLink');
            const result = await generateLinkFunction();
            const shareId = result.data.shareId;
            if (shareId) {
                const link = `${window.location.origin}/share/expense-report/${shareId}`;
                setShareLink(link);
            } else {
                throw new Error("No shareId received from function.");
            }
        } catch (error) {
            console.error("Error generating share link:", error);
            if (error.code === 'functions/unauthenticated') {
                 setLinkError(`Authentication failed: ${error.message}. Please try logging out and back in.`);
            } else {
                 setLinkError(`Failed to generate link: ${error.message}`);
            }
        } finally {
            setGeneratingLink(false);
        }
    }, [activeUser, functions, auth]);

    const copyToClipboard = useCallback(() => {
        if (!shareLink) return;
        navigator.clipboard.writeText(shareLink).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }, (err) => {
            console.error('Failed to copy link: ', err);
            setLinkError('Failed to copy link to clipboard.');
        });
    }, [shareLink]);

    return {
        shareLink,
        generateLink,
        generatingLink,
        linkError,
        copyToClipboard,
        copied
    };
}
