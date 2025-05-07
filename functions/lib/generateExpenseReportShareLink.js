const { onCall, HttpsError } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const { v4: uuidv4 } = require("uuid");

const db = admin.firestore();

/**
 * Generates or retrieves a unique shareable link ID for the calling user's expense report.
 */
const generateExpenseReportShareLink = onCall(async (request) => {
  logger.info("generateExpenseReportShareLink called.");

  if (request.rawRequest && request.rawRequest.headers) {
    logger.info("Raw Request Headers:", JSON.stringify(request.rawRequest.headers));
    logger.info("Authorization Header:", request.rawRequest.headers.authorization || "Not Present");
    logger.info("X-Firebase-AppCheck Header:", request.rawRequest.headers["x-firebase-appcheck"] || "Not Present");
  } else {
    logger.info("Raw request or headers not available in request object for logging.");
  }

  logger.info("request.auth:", JSON.stringify(request.auth || null));
  logger.info("request.app:", JSON.stringify(request.app || null));

  if (!request.auth) {
    logger.error("Authentication check failed: request.auth is missing.");
    throw new HttpsError(
      "unauthenticated",
      "User must be logged in to generate a share link.",
    );
  }
  const userId = request.auth.uid;
  const shareCollectionRef = db.collection("sharedExpenseReports");

  try {
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
    throw new HttpsError(
      "internal",
      "Could not generate share link.",
      error.message,
    );
  }
});

module.exports = { generateExpenseReportShareLink };
