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

import { useState, useCallback } from 'react';
import { getFunctions, httpsCallable } from "firebase/functions";
import { getAuth } from "firebase/auth";
import { useAuth } from '../../../contexts/AuthContext';

/**
 * Custom hook to manage the generation and handling of a shareable link for an expense report.
 * It interacts with a Firebase Function to create a unique share ID.
 *
 * @returns {object} An object containing:
 *  - `shareLink` {string}: The generated shareable link.
 *  - `generateLink` {function}: Async function to trigger the link generation process.
 *  - `generatingLink` {boolean}: Loading state indicating if link generation is in progress.
 *  - `linkError` {string}: Error message if link generation fails.
 *  - `copyToClipboard` {function}: Function to copy the generated link to the clipboard.
 *  - `copied` {boolean}: State indicating if the link has been recently copied.
 */
export function useShareLink() {
    const { activeUser, app } = useAuth();
    const functions = getFunctions(app);
    const auth = getAuth(app);

    /** @state {string} shareLink - The generated shareable URL. */
    const [shareLink, setShareLink] = useState('');
    /** @state {boolean} generatingLink - True if the link generation process is active. */
    const [generatingLink, setGeneratingLink] = useState(false);
    /** @state {string} linkError - Stores any error message from the link generation attempt. */
    const [linkError, setLinkError] = useState('');
    /** @state {boolean} copied - True if the share link has been successfully copied to the clipboard. */
    const [copied, setCopied] = useState(false);

    /**
     * Calls a Firebase Function to generate a unique share ID and constructs the shareable link.
     * Updates state with the link, loading status, and any errors.
     * @async
     */
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

    /**
     * Copies the current `shareLink` to the user's clipboard.
     * Sets the `copied` state to true temporarily on success.
     */
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
