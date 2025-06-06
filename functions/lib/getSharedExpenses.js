const { onCall, HttpsError } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

const db = admin.firestore();

/**
 * Fetches expenses associated with a given shareId. Publicly accessible.
 * Only returns expenses that are 'pending'.
 */
const getSharedExpenses = onCall(
  {
    enforceAppCheck: true, // Enable App Check enforcement
  },
  async (request) => {
  const { shareId } = request.data;
  logger.info("[getSharedExpenses] Function called with shareId:", shareId);

  if (!shareId || typeof shareId !== "string") {
    logger.error("[getSharedExpenses] Invalid shareId received:", shareId);
    throw new HttpsError(
      "invalid-argument",
      "A valid shareId must be provided.",
    );
  }

  try {
    const shareDocRef = db.collection("sharedExpenseReports").doc(shareId);
    logger.info("[getSharedExpenses] Looking up share document:", shareDocRef.path);
    const shareDoc = await shareDocRef.get();

    if (!shareDoc.exists) {
      logger.warn("[getSharedExpenses] Share document not found for shareId:", shareId);
      throw new HttpsError("not-found", "Invalid or expired share link.");
    }
    const shareData = shareDoc.data();
    const userId = shareData.userId;
    logger.info("[getSharedExpenses] Found share document. userId:", userId, "Data:", shareData);

    if (!userId) {
        logger.error("[getSharedExpenses] Share document found, but userId is missing. shareId:", shareId, "Data:", shareData);
        throw new HttpsError("internal", "Share link data is corrupted (missing userId).");
    }

    const expensesColRef = db.collection("users").doc(userId).collection("expenses");
    logger.info("[getSharedExpenses] Querying expenses collection:", expensesColRef.path);
    const q = expensesColRef.orderBy("createdAt", "desc");
    const expensesSnapshot = await q.get();
    logger.info(`[getSharedExpenses] Query completed. Found ${expensesSnapshot.size} total expense documents for user ${userId}.`);

    const allExpenses = [];
    expensesSnapshot.forEach((doc) => {
      allExpenses.push({ ...doc.data(), id: doc.id });
    });

    const expensesToShare = allExpenses.filter(exp => exp.status === 'pending');
    logger.info(`[getSharedExpenses] Filtering for 'pending' status. Returning ${expensesToShare.length} pending expenses for shareId ${shareId}`);

    return { expenses: expensesToShare };
  } catch (error) {
    logger.error(`[getSharedExpenses] Error processing shareId ${shareId}:`, error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError(
      "internal",
      "Could not fetch shared expenses.",
      error.message,
    );
  }
});

module.exports = { getSharedExpenses };
