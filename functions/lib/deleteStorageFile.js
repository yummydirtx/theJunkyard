const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");
const { HttpsError } = require("firebase-functions/v2/https");

const storage = admin.storage();
const defaultBucket = storage.bucket(); // Get the default Storage bucket

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
        throw new HttpsError(
          "internal",
          `Failed to delete receipt file: ${filePath}`,
        );
      }
    }
  } else {
    logger.warn(`Could not parse file path from gsUri: ${gsUri}`);
    // Throw error as this indicates a problem with the stored URI
    throw new HttpsError(
      "invalid-argument",
      `Invalid gsUri format: ${gsUri}`,
    );
  }
};

module.exports = { deleteStorageFile };
