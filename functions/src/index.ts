// functions/src/index.ts
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

// הגדרת התבנית לנתונים הנכנסים נשארת זהה
interface NewUserData {
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
}

// הפונקציה שלנו מקבלת את כל אובייקט הבקשה
export const createNewUser = functions.https.onCall(
  async (request, context) => { // <-- שינינו את שם הפרמטר הראשון ל-'request'
    
    // --- התיקון כאן ---
    // אנו מוציאים את המידע מהשדה 'data' של אובייקט הבקשה
    // ומשתמשים ב- 'as' כדי להגיד ל-TypeScript מה המבנה של הנתונים האלה.
    const data = request.data as NewUserData;
    const { email, password, fullName, phoneNumber } = data;

    // מכאן והלאה, שאר הקוד נשאר בדיוק אותו הדבר
    if (!email || !password || !fullName) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing required fields: email, password, fullName."
      );
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
    } catch (error: any) {
      throw new functions.https.HttpsError("internal", error.message);
    }
  }
);