const { onCall, HttpsError } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const { deleteStorageFile } = require("./deleteStorageFile"); // Import the helper

const db = admin.firestore();

/**
 * Updates the status (reimbursed/denied) of specified expenses via a share link.
 * Also deletes the receipt from storage if reimbursed or denied.
 */
const updateSharedExpenseStatus = onCall(async (request) => {
  const { shareId, expenseIds, action, reason } = request.data;
  logger.info("[updateSharedExpenseStatus] Function called with:", { shareId, expenseIds, action, reason });

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

  try {
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

    const userExpensesRef = db.collection("users").doc(userId).collection("expenses");
    logger.info("[updateSharedExpenseStatus] User expenses collection path:", userExpensesRef.path);

    const batch = db.batch();
    const storageDeletionPromises = [];
    const expensesToUpdate = [];

    logger.info("[updateSharedExpenseStatus] Querying for expense documents with IDs:", expenseIds);
    const expenseDocs = await userExpensesRef
      .where(admin.firestore.FieldPath.documentId(), "in", expenseIds)
      .get();

    logger.info(`[updateSharedExpenseStatus] Firestore query returned ${expenseDocs.size} documents.`);
    if (expenseDocs.size !== expenseIds.length) {
       logger.warn(`[updateSharedExpenseStatus] Mismatch: requested ${expenseIds.length} updates, found ${expenseDocs.size} docs for user ${userId}`);
    }

    expenseDocs.forEach((doc) => {
      if (!doc.exists) {
        logger.warn(`[updateSharedExpenseStatus] Document ${doc.id} unexpectedly not found in query result. Skipping.`);
        return;
      }

      const expenseData = doc.data();
      const expenseRef = userExpensesRef.doc(doc.id);
      logger.info(`[updateSharedExpenseStatus] Processing doc ID: ${doc.id}, Path: ${expenseRef.path}`);
      expensesToUpdate.push(doc.id);

      let updatePayload;
      const now = admin.firestore.FieldValue.serverTimestamp();

      if (action === "reimburse") {
        updatePayload = {
          status: "reimbursed",
          denialReason: null,
          receiptUri: null,
          updatedAt: now,
          processedAt: now,
        };
        logger.info(`[updateSharedExpenseStatus] Adding 'reimburse' update to batch for ${doc.id}:`, updatePayload);
        batch.update(expenseRef, updatePayload);
        if (expenseData.receiptUri) {
          logger.info(`[updateSharedExpenseStatus] Scheduling storage deletion for reimbursed receipt: ${expenseData.receiptUri}`);
          storageDeletionPromises.push(deleteStorageFile(expenseData.receiptUri));
        }
      } else { // action === 'deny'
        updatePayload = {
          status: "denied",
          denialReason: reason || null,
          receiptUri: null,
          updatedAt: now,
          processedAt: now,
        };
        logger.info(`[updateSharedExpenseStatus] Adding 'deny' update to batch for ${doc.id}:`, updatePayload);
        batch.update(expenseRef, updatePayload);
        if (expenseData.receiptUri) {
          logger.info(`[updateSharedExpenseStatus] Scheduling storage deletion for denied receipt: ${expenseData.receiptUri}`);
          storageDeletionPromises.push(deleteStorageFile(expenseData.receiptUri));
        }
      }
    });

    if (expensesToUpdate.length === 0) {
        logger.warn("[updateSharedExpenseStatus] No valid expense documents found to update. Skipping batch commit.");
        return { success: true, updatedCount: 0 };
    }

    logger.info(`[updateSharedExpenseStatus] Committing batch update for ${expensesToUpdate.length} documents.`);
    await batch.commit();
    logger.info(`[updateSharedExpenseStatus] Batch commit successful. Updated status to '${action}' for expenses:`, expensesToUpdate);

    if (storageDeletionPromises.length > 0) {
      logger.info(`[updateSharedExpenseStatus] Waiting for ${storageDeletionPromises.length} storage deletion(s) to settle.`);
      const results = await Promise.allSettled(storageDeletionPromises);
      results.forEach((result, index) => {
        if (result.status === "rejected") {
          logger.error(`[updateSharedExpenseStatus] Storage deletion failed (Promise ${index}):`, result.reason);
        } else {
          logger.info(`[updateSharedExpenseStatus] Storage deletion succeeded (Promise ${index}).`);
        }
      });
      logger.info("[updateSharedExpenseStatus] Finished processing storage deletions.");
    }

    logger.info("[updateSharedExpenseStatus] Function finished successfully.", { updatedCount: expensesToUpdate.length });
    return { success: true, updatedCount: expensesToUpdate.length };

  } catch (error) {
    logger.error(`[updateSharedExpenseStatus] Error processing shareId ${shareId}:`, error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError(
      "internal",
      "Could not update expense statuses.",
      error.message,
    );
  }
});

module.exports = { updateSharedExpenseStatus };
