// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
const functions = require("firebase-functions");
// The Firebase Admin SDK to access Firestore and Storage.
const admin = require("firebase-admin");

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

// You might have other functions defined here...
// exports.myOtherFunction = functions.https.onCall(...)
