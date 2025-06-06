const { onCall, HttpsError } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

const db = admin.firestore();
const storage = admin.storage();
const defaultBucket = storage.bucket();

/**
 * Generates a short-lived signed URL for a specific expense receipt,
 * verifying access via the shareId.
 */
const getReceiptDownloadUrl = onCall(
  {
    enforceAppCheck: true, // Enable App Check enforcement
  },
  async (request) => {
  const { shareId, expenseId } = request.data;
  logger.info("[getReceiptDownloadUrl] Function called with:", { shareId, expenseId });

  if (!shareId || typeof shareId !== "string") {
    logger.error("[getReceiptDownloadUrl] Validation failed: Invalid shareId", { shareId });
    throw new HttpsError("invalid-argument", "A valid shareId must be provided.");
  }
  if (!expenseId || typeof expenseId !== "string") {
    logger.error("[getReceiptDownloadUrl] Validation failed: Invalid expenseId", { expenseId });
    throw new HttpsError("invalid-argument", "A valid expenseId must be provided.");
  }
  logger.info("[getReceiptDownloadUrl] Input validation passed.");

  try {
    const shareDocRef = db.collection("sharedExpenseReports").doc(shareId);
    logger.info("[getReceiptDownloadUrl] Looking up share document:", shareDocRef.path);
    const shareDoc = await shareDocRef.get();

    if (!shareDoc.exists) {
      logger.warn("[getReceiptDownloadUrl] Share document not found:", shareDocRef.path);
      throw new HttpsError("not-found", "Invalid or expired share link.");
    }
    const userId = shareDoc.data().userId;
    if (!userId) {
        logger.error("[getReceiptDownloadUrl] Share document found, but userId is missing:", shareDocRef.path, shareDoc.data());
        throw new HttpsError("internal", "Share link data is corrupted (missing userId).");
    }
    logger.info("[getReceiptDownloadUrl] Found userId:", userId, "for shareId:", shareId);

    const expenseDocRef = db.collection("users").doc(userId).collection("expenses").doc(expenseId);
    logger.info("[getReceiptDownloadUrl] Looking up expense document:", expenseDocRef.path);
    const expenseDoc = await expenseDocRef.get();

    if (!expenseDoc.exists) {
      logger.warn("[getReceiptDownloadUrl] Expense document not found:", expenseDocRef.path);
      throw new HttpsError("not-found", "Expense record not found.");
    }

    const expenseData = expenseDoc.data();
    const gsUri = expenseData.receiptUri;

    if (!gsUri) {
      logger.warn("[getReceiptDownloadUrl] Expense document found, but receiptUri is missing:", expenseDocRef.path);
      throw new HttpsError("not-found", "No receipt is attached to this expense.");
    }
    logger.info("[getReceiptDownloadUrl] Found receiptUri:", gsUri);

    const bucketName = defaultBucket.name;
    const filePath = gsUri.startsWith(`gs://${bucketName}/`) ?
      gsUri.replace(`gs://${bucketName}/`, "") :
      null;

    if (!filePath) {
      logger.error("[getReceiptDownloadUrl] Could not parse file path from gsUri:", gsUri);
      throw new HttpsError("internal", "Invalid receipt file path stored.");
    }
    logger.info("[getReceiptDownloadUrl] Parsed file path:", filePath);

    const options = {
      version: 'v4',
      action: 'read',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    };

    logger.info("[getReceiptDownloadUrl] Generating signed URL for:", filePath);
    const [signedUrl] = await defaultBucket.file(filePath).getSignedUrl(options);
    logger.info("[getReceiptDownloadUrl] Signed URL generated successfully.");

    return { downloadUrl: signedUrl };

  } catch (error) {
    logger.error(`[getReceiptDownloadUrl] Error processing request for shareId ${shareId}, expenseId ${expenseId}:`, error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError(
      "internal",
      "Could not get receipt download URL.",
      error.message,
    );
  }
});

module.exports = { getReceiptDownloadUrl };
