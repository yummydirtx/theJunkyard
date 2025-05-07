// v2 Imports for HTTPS triggers and Scheduler
// const { onCall, HttpsError } = require("firebase-functions/v2/https"); // No longer directly used here
// const { onSchedule } = require("firebase-functions/v2/scheduler"); // No longer directly used here
// v2 Logger
const logger = require("firebase-functions/logger");
// The Firebase Admin SDK to access Firestore and Storage.
const admin = require("firebase-admin");
// UUID for generating unique share IDs - no longer directly used here
// const { v4: uuidv4 } = require("uuid");

// Initialize Firebase Admin SDK
try {
  admin.initializeApp();
} catch (e) {
  // Use logger for errors
  logger.error("Firebase admin initialization error", e);
}

// These are initialized in individual files as needed, or can be passed if preferred.
// const db = admin.firestore();
// const storage = admin.storage();
// const defaultBucket = storage.bucket(); // Get the default Storage bucket

// --- Import and Export Functions from lib ---

const { cleanupOrphanReceipts } = require("./lib/cleanupOrphanReceipts");
const { generateExpenseReportShareLink } = require("./lib/generateExpenseReportShareLink");
const { getSharedExpenses } = require("./lib/getSharedExpenses");
const { updateSharedExpenseStatus } = require("./lib/updateSharedExpenseStatus");
const { getReceiptDownloadUrl } = require("./lib/getReceiptDownloadUrl");

exports.cleanupOrphanReceipts = cleanupOrphanReceipts;
exports.generateExpenseReportShareLink = generateExpenseReportShareLink;
exports.getSharedExpenses = getSharedExpenses;
exports.updateSharedExpenseStatus = updateSharedExpenseStatus;
exports.getReceiptDownloadUrl = getReceiptDownloadUrl;
