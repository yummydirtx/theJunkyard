const { onSchedule } = require("firebase-functions/v2/scheduler");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const { deleteStorageFile } = require("./deleteStorageFile"); // Import the helper

const db = admin.firestore();
const defaultBucket = admin.storage().bucket();

/**
 * Scheduled function to clean up orphaned receipts from Cloud Storage.
 * Runs periodically (e.g., every 24 hours).
 */
const cleanupOrphanReceipts = onSchedule("every 24 hours", async (event) => {
  logger.info("Running scheduled job: cleanupOrphanReceipts", { structuredData: true, event });

  const thresholdHours = 24;
  const thresholdMillis = thresholdHours * 60 * 60 * 1000;
  const thresholdTimestamp = admin.firestore.Timestamp.fromMillis(
    Date.now() - thresholdMillis,
  );

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

    const deletionPromises = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      const gsUri = data.gsUri;
      const docId = doc.id;

      if (!gsUri) {
        logger.warn(`Pending doc ${docId} missing gsUri, deleting doc only.`);
        deletionPromises.push(
          doc.ref.delete().catch((err) => {
            logger.error(`Failed to delete Firestore doc ${docId}:`, err);
          }),
        );
        return;
      }

      // Use the imported deleteStorageFile function
      // Note: deleteStorageFile is async and can throw. We'll catch errors from it via Promise.allSettled.
      // The original logic for deleting storage file directly is now encapsulated.
      // We can simplify the direct deletion logic here or rely on the helper.
      // For consistency with the helper, we'll use it.
      // However, the original code had slightly different logging/error handling for this specific function.
      // Let's adapt the original logic slightly to fit the helper or keep it separate if the logic is very distinct.
      // For now, let's use the helper and see. The helper throws HttpsError which might not be ideal for a scheduled function.
      // Let's re-inline a simplified version for the scheduled task, or modify deleteStorageFile to be more generic.

      // Re-evaluating: The original cleanupOrphanReceipts had its own storage deletion logic.
      // Let's keep that distinct for now to preserve its specific error handling for scheduled tasks.
      const bucketName = defaultBucket.name;
      const filePath = gsUri.startsWith(`gs://${bucketName}/`) ?
        gsUri.replace(`gs://${bucketName}/`, "") :
        null;

      if (filePath) {
        const fileRef = defaultBucket.file(filePath);
        logger.info(`Attempting to delete Storage file: ${filePath}`);
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
              // Unlike the helper, this doesn't throw HttpsError, which is suitable for a background job.
            }),
        );
      } else {
        logger.warn(`Could not parse file path from gsUri: ${gsUri} in doc ${docId}`);
      }

      logger.info(`Attempting to delete Firestore doc: ${docId}`);
      deletionPromises.push(
        doc.ref.delete().catch((err) => {
          logger.error(`Failed to delete Firestore doc ${docId}:`, err);
        }),
      );
    });

    await Promise.allSettled(deletionPromises);
    logger.info("Cleanup process finished.");
    return null;
  } catch (error) {
    logger.error("Error querying or processing old pending receipts:", error);
    return null;
  }
});

module.exports = { cleanupOrphanReceipts };
