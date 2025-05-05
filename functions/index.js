// v2 Imports for HTTPS triggers and Scheduler
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
// v2 Logger
const logger = require("firebase-functions/logger");
// The Firebase Admin SDK to access Firestore and Storage.
const admin = require("firebase-admin");
// UUID for generating unique share IDs
const { v4: uuidv4 } = require("uuid");

// Initialize Firebase Admin SDK
try {
  admin.initializeApp();
} catch (e) {
  // Use logger for errors
  logger.error("Firebase admin initialization error", e);
}

const db = admin.firestore();
const storage = admin.storage();
const defaultBucket = storage.bucket(); // Get the default Storage bucket

// --- Helper Function to Delete Storage File ---
/**
 * Deletes a file from Firebase Storage using its gs:// URI.
 * @param {string} gsUri The gs:// URI of the file.
 * @return {Promise<void>} A promise that resolves when deletion is attempted.
 */
const deleteStorageFile = async (gsUri) => {
  if (!gsUri) {
    logger.info("No gsUri provided, skipping Storage deletion.");
    return;
  }
  const bucketName = defaultBucket.name;
  const filePath = gsUri.startsWith(`gs://${bucketName}/`) ?
    gsUri.replace(`gs://${bucketName}/`, "") :
    null;

  if (filePath) {
    const fileRef = defaultBucket.file(filePath);
    logger.info(`Attempting to delete Storage file: ${filePath}`);
    try {
      await fileRef.delete();
      logger.info(`Successfully deleted Storage file: ${filePath}`);
    } catch (err) {
      if (err.code === 404) {
        logger.warn(
          `Storage file not found (may be already deleted): ${filePath}`,
        );
      } else {
        logger.error(`Failed to delete Storage file ${filePath}:`, err);
        // Re-throw or handle as needed, maybe prevent Firestore update if critical
        throw new HttpsError( // Use HttpsError from v2 import
          "internal",
          `Failed to delete receipt file: ${filePath}`,
        );
      }
    }
  } else {
    logger.warn(`Could not parse file path from gsUri: ${gsUri}`);
    // Throw error as this indicates a problem with the stored URI
    throw new HttpsError( // Use HttpsError from v2 import
      "invalid-argument",
      `Invalid gsUri format: ${gsUri}`,
    );
  }
};

// --- Scheduled Function (v2 Syntax) ---

/**
 * Scheduled function to clean up orphaned receipts from Cloud Storage.
 * Runs periodically (e.g., every 24 hours).
 */
// Use the v2 onSchedule syntax
exports.cleanupOrphanReceipts = onSchedule("every 24 hours", async (event) => {
  // Use logger
  logger.info("Running scheduled job: cleanupOrphanReceipts", { structuredData: true, event });

  // Calculate the timestamp threshold (e.g., 24 hours ago)
  const thresholdHours = 24;
  const thresholdMillis = thresholdHours * 60 * 60 * 1000;
  const thresholdTimestamp = admin.firestore.Timestamp.fromMillis(
    Date.now() - thresholdMillis,
  );

  // Query for pending receipts older than the threshold
  const pendingReceiptsRef = db.collection("pendingReceipts");
  const oldPendingReceiptsQuery = pendingReceiptsRef.where(
    "uploadTimestamp",
    "<",
    thresholdTimestamp,
  );

  try {
    const snapshot = await oldPendingReceiptsQuery.get();
    if (snapshot.empty) {
      logger.info("No old pending receipts found to clean up.");
      return null;
    }

    logger.info(`Found ${snapshot.size} old pending receipts to clean up.`);

    const deletionPromises = []; // Store promises for concurrent execution

    snapshot.forEach((doc) => {
      const data = doc.data();
      const gsUri = data.gsUri;
      const docId = doc.id;

      if (!gsUri) {
        logger.warn(`Pending doc ${docId} missing gsUri, deleting doc only.`);
        // Add promise to delete the Firestore document only
        deletionPromises.push(
          doc.ref.delete().catch((err) => {
            logger.error(`Failed to delete Firestore doc ${docId}:`, err);
          }),
        );
        return; // Skip Storage deletion for this doc
      }

      // --- Delete Storage File ---
      const bucketName = defaultBucket.name;
      const filePath = gsUri.startsWith(`gs://${bucketName}/`) ?
        gsUri.replace(`gs://${bucketName}/`, "") :
        null;

      if (filePath) {
        const fileRef = defaultBucket.file(filePath);
        logger.info(`Attempting to delete Storage file: ${filePath}`);
        // Add promise for Storage file deletion
        deletionPromises.push(
          fileRef
            .delete()
            .then(() => logger.info(`Successfully deleted Storage file: ${filePath}`))
            .catch((err) => {
              if (err.code === 404) {
                logger.warn(`Storage file not found (may be already deleted): ${filePath}`);
              } else {
                logger.error(`Failed to delete Storage file ${filePath}:`, err);
              }
            }),
        );
      } else {
        logger.warn(`Could not parse file path from gsUri: ${gsUri} in doc ${docId}`);
      }

      // --- Delete Firestore Document ---
      logger.info(`Attempting to delete Firestore doc: ${docId}`);
      deletionPromises.push(
        doc.ref.delete().catch((err) => {
          logger.error(`Failed to delete Firestore doc ${docId}:`, err);
        }),
      );
    }); // End snapshot.forEach

    // Wait for all deletion operations to settle
    await Promise.allSettled(deletionPromises);
    logger.info("Cleanup process finished.");
    return null;
  } catch (error) {
    logger.error("Error querying or processing old pending receipts:", error);
    return null; // Indicate failure, but function completed
  }
});


// --- Callable Functions (v2 Syntax) ---

/**
 * Generates or retrieves a unique shareable link ID for the calling user's expense report.
 */
// Use v2 onCall signature: (request) => { ... }
exports.generateExpenseReportShareLink = onCall(async (request) => {
  logger.info("generateExpenseReportShareLink called.");

  // Log headers (request.rawRequest might contain them)
  if (request.rawRequest && request.rawRequest.headers) {
    logger.info("Raw Request Headers:", JSON.stringify(request.rawRequest.headers));
    logger.info("Authorization Header:", request.rawRequest.headers.authorization || "Not Present");
    logger.info("X-Firebase-AppCheck Header:", request.rawRequest.headers["x-firebase-appcheck"] || "Not Present");
  } else {
    logger.info("Raw request or headers not available in request object for logging.");
  }

  // Access auth and app context via request object
  logger.info("request.auth:", JSON.stringify(request.auth || null));
  logger.info("request.app:", JSON.stringify(request.app || null));

  // Check authentication using request.auth
  if (!request.auth) {
    logger.error("Authentication check failed: request.auth is missing.");
    throw new HttpsError( // Use HttpsError from v2 import
      "unauthenticated",
      "User must be logged in to generate a share link.",
    );
  }
  const userId = request.auth.uid;
  const shareCollectionRef = db.collection("sharedExpenseReports");

  try {
    // Check if a share link already exists for this user
    const existingQuery = shareCollectionRef.where("userId", "==", userId).limit(1);
    const existingSnapshot = await existingQuery.get();

    if (!existingSnapshot.empty) {
      const existingDoc = existingSnapshot.docs[0];
      logger.info(`Returning existing shareId ${existingDoc.id} for user ${userId}`);
      return { shareId: existingDoc.id };
    } else {
      const shareId = uuidv4();
      await shareCollectionRef.doc(shareId).set({
        userId: userId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      logger.info(`Generated new shareId ${shareId} for user ${userId}`);
      return { shareId: shareId };
    }
  } catch (error) {
    logger.error("Error generating share link for user", userId, error);
    throw new HttpsError( // Use HttpsError from v2 import
      "internal",
      "Could not generate share link.",
      error.message,
    );
  }
});

/**
 * Fetches expenses associated with a given shareId. Publicly accessible.
 * Only returns expenses that are 'pending'.
 */
// Use v2 onCall signature: (request) => { ... }
exports.getSharedExpenses = onCall(async (request) => {
  // Access data via request.data
  const { shareId } = request.data;
  logger.info("[getSharedExpenses] Function called with shareId:", shareId); // Log input

  if (!shareId || typeof shareId !== "string") {
    logger.error("[getSharedExpenses] Invalid shareId received:", shareId); // Log validation failure
    throw new HttpsError( // Use HttpsError from v2 import
      "invalid-argument",
      "A valid shareId must be provided.",
    );
  }

  try {
    const shareDocRef = db.collection("sharedExpenseReports").doc(shareId);
    logger.info("[getSharedExpenses] Looking up share document:", shareDocRef.path); // Log lookup path
    const shareDoc = await shareDocRef.get();

    if (!shareDoc.exists) {
      logger.warn("[getSharedExpenses] Share document not found for shareId:", shareId); // Log not found
      throw new HttpsError("not-found", "Invalid or expired share link."); // Use HttpsError
    }
    const shareData = shareDoc.data();
    const userId = shareData.userId;
    logger.info("[getSharedExpenses] Found share document. userId:", userId, "Data:", shareData); // Log found userId and data

    if (!userId) {
        logger.error("[getSharedExpenses] Share document found, but userId is missing. shareId:", shareId, "Data:", shareData); // Log missing userId
        throw new HttpsError("internal", "Share link data is corrupted (missing userId).");
    }

    // 2. Fetch expenses for that userId, ordered by creation time
    const expensesColRef = db.collection("users").doc(userId).collection("expenses");
    logger.info("[getSharedExpenses] Querying expenses collection:", expensesColRef.path); // Log query path
    const q = expensesColRef.orderBy("createdAt", "desc");
    const expensesSnapshot = await q.get();
    logger.info(`[getSharedExpenses] Query completed. Found ${expensesSnapshot.size} total expense documents for user ${userId}.`); // Log query result size

    const allExpenses = [];
    expensesSnapshot.forEach((doc) => {
      allExpenses.push({ ...doc.data(), id: doc.id });
    });

    // 3. Filter to keep only 'pending' expenses
    const expensesToShare = allExpenses.filter(exp => exp.status === 'pending');
    logger.info(`[getSharedExpenses] Filtering for 'pending' status. Returning ${expensesToShare.length} pending expenses for shareId ${shareId}`);

    return { expenses: expensesToShare }; // Return the filtered list (pending only)
  } catch (error) {
    // Log the specific error before potentially re-throwing
    logger.error(`[getSharedExpenses] Error processing shareId ${shareId}:`, error);
    if (error instanceof HttpsError) { // Check against imported HttpsError
      throw error; // Re-throw known HttpsError
    }
    // Throw a generic internal error for unexpected issues
    throw new HttpsError( // Use HttpsError
      "internal",
      "Could not fetch shared expenses.",
      error.message, // Include original error message if available
    );
  }
});

/**
 * Updates the status (reimbursed/denied) of specified expenses via a share link.
 */
// Use v2 onCall signature: (request) => { ... }
exports.updateSharedExpenseStatus = onCall(async (request) => {
  // Access data via request.data
  const { shareId, expenseIds, action, reason } = request.data;
  // Log Input
  logger.info("[updateSharedExpenseStatus] Function called with:", { shareId, expenseIds, action, reason });

  // --- Validation ---
  if (!shareId || typeof shareId !== "string") {
    logger.error("[updateSharedExpenseStatus] Validation failed: Invalid shareId", { shareId });
    throw new HttpsError("invalid-argument", "A valid shareId must be provided.");
  }
  if (!Array.isArray(expenseIds) || expenseIds.length === 0) {
    logger.error("[updateSharedExpenseStatus] Validation failed: Invalid expenseIds", { expenseIds });
    throw new HttpsError("invalid-argument", "An array of expenseIds must be provided.");
  }
  if (action !== "reimburse" && action !== "deny") {
    logger.error("[updateSharedExpenseStatus] Validation failed: Invalid action", { action });
    throw new HttpsError("invalid-argument", "Action must be either 'reimburse' or 'deny'.");
  }
  if (action === "deny" && reason && typeof reason !== "string") {
    logger.error("[updateSharedExpenseStatus] Validation failed: Invalid reason type", { reason });
    throw new HttpsError("invalid-argument", "Denial reason must be a string if provided.");
  }
  logger.info("[updateSharedExpenseStatus] Input validation passed.");
  // --- End Validation ---

  try {
    // 1. Get User ID from Share ID
    const shareDocRef = db.collection("sharedExpenseReports").doc(shareId);
    logger.info("[updateSharedExpenseStatus] Looking up share document:", shareDocRef.path);
    const shareDoc = await shareDocRef.get();

    if (!shareDoc.exists) {
      logger.warn("[updateSharedExpenseStatus] Share document not found:", shareDocRef.path);
      throw new HttpsError("not-found", "Invalid or expired share link.");
    }
    const userId = shareDoc.data().userId;
    if (!userId) {
        logger.error("[updateSharedExpenseStatus] Share document found, but userId is missing:", shareDocRef.path, shareDoc.data());
        throw new HttpsError("internal", "Share link data is corrupted (missing userId).");
    }
    logger.info("[updateSharedExpenseStatus] Found userId:", userId, "for shareId:", shareId);

    // 2. Prepare Batch Update
    // Correctly reference the subcollection: users/{userId}/expenses
    const userExpensesRef = db.collection("users").doc(userId).collection("expenses");
    logger.info("[updateSharedExpenseStatus] User expenses collection path:", userExpensesRef.path);

    const batch = db.batch();
    const storageDeletionPromises = [];
    const expensesToUpdate = []; // Track IDs actually being updated

    // 3. Query for the specific expense documents
    logger.info("[updateSharedExpenseStatus] Querying for expense documents with IDs:", expenseIds);
    const expenseDocs = await userExpensesRef
      .where(admin.firestore.FieldPath.documentId(), "in", expenseIds)
      .get();

    logger.info(`[updateSharedExpenseStatus] Firestore query returned ${expenseDocs.size} documents.`);
    if (expenseDocs.size !== expenseIds.length) {
       logger.warn(`[updateSharedExpenseStatus] Mismatch: requested ${expenseIds.length} updates, found ${expenseDocs.size} docs for user ${userId}`);
    }

    // 4. Iterate and add updates to batch
    expenseDocs.forEach((doc) => {
      if (!doc.exists) {
        // This case shouldn't happen with the 'in' query, but good practice
        logger.warn(`[updateSharedExpenseStatus] Document ${doc.id} unexpectedly not found in query result. Skipping.`);
        return;
      }

      const expenseData = doc.data();
      const expenseRef = userExpensesRef.doc(doc.id);
      logger.info(`[updateSharedExpenseStatus] Processing doc ID: ${doc.id}, Path: ${expenseRef.path}`);
      expensesToUpdate.push(doc.id); // Add ID to tracking array

      let updatePayload;
      if (action === "reimburse") {
        updatePayload = {
          status: "reimbursed",
          denialReason: null,
          receiptUri: null, // Clear receipt URI on reimbursement
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        logger.info(`[updateSharedExpenseStatus] Adding 'reimburse' update to batch for ${doc.id}:`, updatePayload);
        batch.update(expenseRef, updatePayload);
        // Schedule receipt deletion if URI exists
        if (expenseData.receiptUri) {
          logger.info(`[updateSharedExpenseStatus] Scheduling storage deletion for receipt: ${expenseData.receiptUri}`);
          storageDeletionPromises.push(deleteStorageFile(expenseData.receiptUri));
        }
      } else { // action === 'deny'
        updatePayload = {
          status: "denied",
          denialReason: reason || null,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        logger.info(`[updateSharedExpenseStatus] Adding 'deny' update to batch for ${doc.id}:`, updatePayload);
        batch.update(expenseRef, updatePayload);
      }
    });

    // 5. Commit Batch
    if (expensesToUpdate.length === 0) {
        logger.warn("[updateSharedExpenseStatus] No valid expense documents found to update. Skipping batch commit.");
        // Return success but indicate 0 updates
        return { success: true, updatedCount: 0 };
    }

    logger.info(`[updateSharedExpenseStatus] Committing batch update for ${expensesToUpdate.length} documents.`);
    await batch.commit();
    logger.info(`[updateSharedExpenseStatus] Batch commit successful. Updated status to '${action}' for expenses:`, expensesToUpdate);

    // 6. Handle Storage Deletions (if any)
    if (storageDeletionPromises.length > 0) {
      logger.info(`[updateSharedExpenseStatus] Waiting for ${storageDeletionPromises.length} storage deletion(s) to settle.`);
      const results = await Promise.allSettled(storageDeletionPromises);
      results.forEach((result, index) => {
        if (result.status === "rejected") {
          // Log the error associated with the failed deletion
          logger.error(`[updateSharedExpenseStatus] Storage deletion failed (Promise ${index}):`, result.reason);
        } else {
          logger.info(`[updateSharedExpenseStatus] Storage deletion succeeded (Promise ${index}).`);
        }
      });
      logger.info("[updateSharedExpenseStatus] Finished processing storage deletions.");
    }

    // 7. Return Success
    logger.info("[updateSharedExpenseStatus] Function finished successfully.", { updatedCount: expensesToUpdate.length });
    return { success: true, updatedCount: expensesToUpdate.length };

  } catch (error) {
    // Log the specific error before potentially re-throwing
    logger.error(`[updateSharedExpenseStatus] Error processing shareId ${shareId}:`, error);
    if (error instanceof HttpsError) { // Check against imported HttpsError
      throw error; // Re-throw known HttpsError
    }
    // Throw a generic internal error for unexpected issues
    throw new HttpsError( // Use HttpsError
      "internal",
      "Could not update expense statuses.",
      error.message, // Include original error message if available
    );
  }
});
