// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
const functions = require("firebase-functions");
// The Firebase Admin SDK to access Firestore and Storage.
const admin = require("firebase-admin");
// UUID for generating unique share IDs
const { v4: uuidv4 } = require("uuid");

// Initialize Firebase Admin SDK
// Ensure your service account key is set up correctly for local emulation or deployment
// (Often handled automatically in the deployed environment)
try {
  admin.initializeApp();
} catch (e) {
  console.error("Firebase admin initialization error", e);
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
    console.log("No gsUri provided, skipping Storage deletion.");
    return;
  }
  const bucketName = defaultBucket.name;
  const filePath = gsUri.startsWith(`gs://${bucketName}/`) ?
    gsUri.replace(`gs://${bucketName}/`, "") :
    null;

  if (filePath) {
    const fileRef = defaultBucket.file(filePath);
    console.log(`Attempting to delete Storage file: ${filePath}`);
    try {
      await fileRef.delete();
      console.log(`Successfully deleted Storage file: ${filePath}`);
    } catch (err) {
      if (err.code === 404) {
        console.warn(
          `Storage file not found (may be already deleted): ${filePath}`,
        );
      } else {
        console.error(`Failed to delete Storage file ${filePath}:`, err);
        // Re-throw or handle as needed, maybe prevent Firestore update if critical
        throw new functions.https.HttpsError(
          "internal",
          `Failed to delete receipt file: ${filePath}`,
        );
      }
    }
  } else {
    console.warn(`Could not parse file path from gsUri: ${gsUri}`);
    // Throw error as this indicates a problem with the stored URI
    throw new functions.https.HttpsError(
      "invalid-argument",
      `Invalid gsUri format: ${gsUri}`,
    );
  }
};

// --- Scheduled Function (Existing) ---

/**
 * Scheduled function to clean up orphaned receipts from Cloud Storage.
 * Runs periodically (e.g., every 24 hours).
 * Checks the 'pendingReceipts' collection for entries older than a threshold
 * and deletes the corresponding file from Storage and the entry from Firestore.
 */
// Use the v2/v3+ syntax for scheduled functions
exports.cleanupOrphanReceipts = functions.scheduler
  // Schedule to run every 24 hours. Use Crontab syntax or App Engine syntax.
  // See: https://firebase.google.com/docs/functions/schedule-functions
  .onSchedule("every 24 hours", async (context) => {
    console.log("Running scheduled job: cleanupOrphanReceipts");

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
        console.log("No old pending receipts found to clean up.");
        return null;
      }

      console.log(`Found ${snapshot.size} old pending receipts to clean up.`);

      const deletionPromises = []; // Store promises for concurrent execution

      snapshot.forEach((doc) => {
        const data = doc.data();
        const gsUri = data.gsUri;
        const docId = doc.id;

        if (!gsUri) {
          console.warn(`Pending doc ${docId} missing gsUri, deleting doc only.`);
          // Add promise to delete the Firestore document only
          deletionPromises.push(
            doc.ref.delete().catch((err) => {
              console.error(`Failed to delete Firestore doc ${docId}:`, err);
            }),
          );
          return; // Skip Storage deletion for this doc
        }

        // --- Delete Storage File ---
        // Extract file path from gs:// URI
        const bucketName = defaultBucket.name;
        const filePath = gsUri.startsWith(`gs://${bucketName}/`) ?
          gsUri.replace(`gs://${bucketName}/`, "") :
          null;

        if (filePath) {
          const fileRef = defaultBucket.file(filePath);
          console.log(`Attempting to delete Storage file: ${filePath}`);
          // Add promise for Storage file deletion
          deletionPromises.push(
            fileRef
              .delete()
              .then(() => console.log(`Successfully deleted Storage file: ${filePath}`))
              .catch((err) => {
                // If file not found, it might have been deleted already (e.g., by client)
                if (err.code === 404) {
                  console.warn(`Storage file not found (may be already deleted): ${filePath}`);
                } else {
                  console.error(`Failed to delete Storage file ${filePath}:`, err);
                  // Decide if you want to proceed deleting the Firestore doc even if Storage deletion failed
                }
              }),
          );
        } else {
          console.warn(`Could not parse file path from gsUri: ${gsUri} in doc ${docId}`);
          // Optionally, still delete the Firestore doc if the URI is invalid
        }

        // --- Delete Firestore Document ---
        console.log(`Attempting to delete Firestore doc: ${docId}`);
        // Add promise for Firestore document deletion (runs after Storage attempt)
        deletionPromises.push(
          doc.ref.delete().catch((err) => {
            console.error(`Failed to delete Firestore doc ${docId}:`, err);
          }),
        );
      }); // End snapshot.forEach

      // Wait for all deletion operations to settle
      await Promise.allSettled(deletionPromises);
      console.log("Cleanup process finished.");
      return null;
    } catch (error) {
      console.error("Error querying or processing old pending receipts:", error);
      return null; // Indicate failure, but function completed
    }
  });


// --- New Callable Functions for Sharing ---

/**
 * Generates or retrieves a unique shareable link ID for the calling user's expense report.
 * Stores the mapping between shareId and userId in Firestore.
 */
exports.generateExpenseReportShareLink = functions.https.onCall(
  async (data, context) => {
    // Check authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be logged in to generate a share link.",
      );
    }
    const userId = context.auth.uid;
    const shareCollectionRef = db.collection("sharedExpenseReports");

    try {
      // Check if a share link already exists for this user
      const existingQuery = shareCollectionRef.where("userId", "==", userId).limit(1);
      const existingSnapshot = await existingQuery.get();

      if (!existingSnapshot.empty) {
        // Return existing shareId
        const existingDoc = existingSnapshot.docs[0];
        console.log(`Returning existing shareId ${existingDoc.id} for user ${userId}`);
        return { shareId: existingDoc.id };
      } else {
        // Generate a new unique shareId
        const shareId = uuidv4();
        // Store the new mapping
        await shareCollectionRef.doc(shareId).set({
          userId: userId,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`Generated new shareId ${shareId} for user ${userId}`);
        return { shareId: shareId };
      }
    } catch (error) {
      console.error("Error generating share link for user", userId, error);
      throw new functions.https.HttpsError(
        "internal",
        "Could not generate share link.",
        error.message,
      );
    }
  },
);

/**
 * Fetches expenses associated with a given shareId. Publicly accessible.
 */
exports.getSharedExpenses = functions.https.onCall(async (data, context) => {
  const { shareId } = data;

  if (!shareId || typeof shareId !== "string") {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "A valid shareId must be provided.",
    );
  }

  try {
    // 1. Find the userId associated with the shareId
    const shareDocRef = db.collection("sharedExpenseReports").doc(shareId);
    const shareDoc = await shareDocRef.get();

    if (!shareDoc.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "Invalid or expired share link.",
      );
    }
    const userId = shareDoc.data().userId;

    // 2. Fetch expenses for that userId, ordered by creation time
    const expensesColRef = db.collection("users", userId, "expenses");
    const q = expensesColRef.orderBy("createdAt", "desc");
    const expensesSnapshot = await q.get();

    const expenses = [];
    expensesSnapshot.forEach((doc) => {
      expenses.push({ ...doc.data(), id: doc.id });
    });

    console.log(`Fetched ${expenses.length} expenses for shareId ${shareId} (user ${userId})`);
    return { expenses };
  } catch (error) {
    console.error(`Error fetching expenses for shareId ${shareId}:`, error);
    if (error instanceof functions.https.HttpsError) {
      throw error; // Re-throw HttpsError
    }
    throw new functions.https.HttpsError(
      "internal",
      "Could not fetch shared expenses.",
      error.message,
    );
  }
});

/**
 * Updates the status (reimbursed/denied) of specified expenses via a share link.
 * Handles receipt deletion for reimbursed items. Publicly accessible via shareId.
 */
exports.updateSharedExpenseStatus = functions.https.onCall(
  async (data, context) => {
    const { shareId, expenseIds, action, reason } = data;

    // --- Validation ---
    if (!shareId || typeof shareId !== "string") {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "A valid shareId must be provided.",
      );
    }
    if (!Array.isArray(expenseIds) || expenseIds.length === 0) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "An array of expenseIds must be provided.",
      );
    }
    if (action !== "reimburse" && action !== "deny") {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Action must be either 'reimburse' or 'deny'.",
      );
    }
    if (action === "deny" && reason && typeof reason !== "string") {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Denial reason must be a string if provided.",
      );
    }
    // --- End Validation ---

    try {
      // 1. Find the userId associated with the shareId
      const shareDocRef = db.collection("sharedExpenseReports").doc(shareId);
      const shareDoc = await shareDocRef.get();

      if (!shareDoc.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          "Invalid or expired share link.",
        );
      }
      const userId = shareDoc.data().userId;
      const userExpensesRef = db.collection("users", userId, "expenses");

      // 2. Process updates in a batch
      const batch = db.batch();
      const storageDeletionPromises = [];
      const expensesToUpdate = []; // Keep track for logging/response

      // Fetch expense docs to get receipt URIs before updating
      const expenseDocs = await userExpensesRef
        .where(admin.firestore.FieldPath.documentId(), "in", expenseIds)
        .get();

      if (expenseDocs.size !== expenseIds.length) {
         console.warn(`Mismatch: requested ${expenseIds.length} updates, found ${expenseDocs.size} docs for user ${userId}`);
         // You might want to throw an error here if an exact match is required
         // throw new functions.https.HttpsError("not-found", "One or more expense IDs were not found.");
      }

      expenseDocs.forEach((doc) => {
        if (!doc.exists) {
          console.warn(`Expense document ${doc.id} not found for user ${userId}. Skipping.`);
          return; // Skip this ID
        }

        const expenseData = doc.data();
        const expenseRef = userExpensesRef.doc(doc.id);
        expensesToUpdate.push(doc.id);

        if (action === "reimburse") {
          batch.update(expenseRef, {
            status: "reimbursed",
            denialReason: null, // Clear any previous denial reason
            receiptUri: null, // Clear receipt URI
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          // If a receipt exists, schedule its deletion
          if (expenseData.receiptUri) {
            storageDeletionPromises.push(deleteStorageFile(expenseData.receiptUri));
          }
        } else { // action === 'deny'
          batch.update(expenseRef, {
            status: "denied",
            denialReason: reason || null, // Store reason or null
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      });

      // 3. Commit Firestore batch updates
      await batch.commit();
      console.log(`Successfully updated status to '${action}' for ${expensesToUpdate.length} expenses for shareId ${shareId}`);

      // 4. Wait for all storage deletions to settle (if any)
      if (storageDeletionPromises.length > 0) {
        const results = await Promise.allSettled(storageDeletionPromises);
        results.forEach((result) => {
          if (result.status === "rejected") {
            // Log errors from deleteStorageFile (already logged within the helper)
            console.error("A storage deletion failed during batch update:", result.reason);
            // Decide if this should cause the function to report an overall error
            // For now, we'll log it but still return success for the Firestore updates
          }
        });
      }

      return { success: true, updatedCount: expensesToUpdate.length };
    } catch (error) {
      console.error(`Error updating expenses for shareId ${shareId}:`, error);
      if (error instanceof functions.https.HttpsError) {
        throw error; // Re-throw HttpsError
      }
      throw new functions.https.HttpsError(
        "internal",
        "Could not update expense statuses.",
        error.message,
      );
    }
  },
);
