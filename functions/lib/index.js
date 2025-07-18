"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNewUser = void 0;
// functions/src/index.ts
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
admin.initializeApp();
// הפונקציה שלנו מקבלת את כל אובייקט הבקשה
exports.createNewUser = functions.https.onCall(async (request, context) => {
    // --- התיקון כאן ---
    // אנו מוציאים את המידע מהשדה 'data' של אובייקט הבקשה
    // ומשתמשים ב- 'as' כדי להגיד ל-TypeScript מה המבנה של הנתונים האלה.
    const data = request.data;
    const { email, password, fullName, phoneNumber } = data;
    // מכאן והלאה, שאר הקוד נשאר בדיוק אותו הדבר
    if (!email || !password || !fullName) {
        throw new functions.https.HttpsError("invalid-argument", "Missing required fields: email, password, fullName.");
    }
    try {
        const userRecord = await admin.auth().createUser({
            email: email,
            password: password,
            displayName: fullName,
            emailVerified: false,
        });
        await admin.firestore().collection("users").doc(userRecord.uid).set({
            fullName: fullName,
            email: email,
            phoneNumber: phoneNumber || "",
            role: "employee",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        return {
            status: "success",
            message: `User ${fullName} created successfully.`,
            uid: userRecord.uid,
        };
    }
    catch (error) {
        throw new functions.https.HttpsError("internal", error.message);
    }
});
//# sourceMappingURL=index.js.map